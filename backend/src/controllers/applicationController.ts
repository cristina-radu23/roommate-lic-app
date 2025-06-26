import { Request, Response } from "express";
import { Application, User, Listing, Notification, ChatRoom, ChatRoomUser } from "../models";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Create a new application
export const createApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { listingId, applicantIds, message } = req.body;

    // Validate input
    if (!listingId || !applicantIds || !Array.isArray(applicantIds)) {
      res.status(400).json({ error: "Invalid input: listingId and applicantIds array required" });
      return;
    }

    // Check if listing exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    // Check if user is not the owner of the listing
    if (listing.userId === userId) {
      res.status(400).json({ error: "Cannot apply to your own listing" });
      return;
    }

    // Check if user is in the applicantIds array
    if (!applicantIds.includes(userId)) {
      res.status(400).json({ error: "User must be included in applicantIds" });
      return;
    }

    // Check if application already exists for this listing and these applicants
    const existingApplication = await Application.findOne({
      where: {
        listingId,
        applicantIds: JSON.stringify(applicantIds.sort()),
        status: "pending"
      }
    });

    if (existingApplication) {
      res.status(400).json({ error: "Application already exists for these applicants" });
      return;
    }

    // Create the application
    const application = await Application.create({
      listingId,
      applicantIds: JSON.stringify(applicantIds.sort()),
      message: message || null,
      status: "pending"
    });

    // Create notification for listing owner
    await Notification.create({
      userId: listing.userId,
      type: "application_received",
      message: `New application received for your listing "${listing.title || 'Apartment listing'}"`,
      link: `/applications/${application.applicationId}`
    });

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application.applicationId
    });

  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get applications for a listing (for listing owner)
export const getApplicationsForListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { listingId } = req.params;

    // Check if listing exists and user is the owner
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (listing.userId !== userId) {
      res.status(403).json({ error: "Not authorized to view applications for this listing" });
      return;
    }

    // Get all applications for this listing
    const applications = await Application.findAll({
      where: { listingId },
      order: [["createdAt", "DESC"]]
    });

    // Get applicant details for each application
    const applicationsWithApplicants = await Promise.all(
      applications.map(async (application) => {
        const applicantIds = JSON.parse(application.applicantIds);
        const applicants = await User.findAll({
          where: { userId: applicantIds },
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "email"]
        });

        return {
          ...application.toJSON(),
          applicants
        };
      })
    );

    res.json(applicationsWithApplicants);

  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get applications by user (for applicants)
export const getApplicationsByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all applications where user is an applicant
    const applications = await Application.findAll({
      order: [["createdAt", "DESC"]]
    });

    // Filter applications where user is an applicant
    const userApplications = applications.filter(app => {
      const applicantIds = JSON.parse(app.applicantIds);
      return applicantIds.includes(userId);
    });

    // Get listing details for each application
    const applicationsWithListings = await Promise.all(
      userApplications.map(async (application) => {
        const listing = await Listing.findByPk(application.listingId, {
          include: [{ model: User, attributes: ["userId", "userFirstName", "userLastName"] }]
        });

        return {
          ...application.toJSON(),
          listing
        };
      })
    );

    res.json(applicationsWithListings);

  } catch (error) {
    console.error("Error getting user applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve an application
export const approveApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { applicationId } = req.params;

    // Get the application
    const application = await Application.findByPk(applicationId);
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Check if listing exists and user is the owner
    const listing = await Listing.findByPk(application.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (listing.userId !== userId) {
      res.status(403).json({ error: "Not authorized to approve this application" });
      return;
    }

    // Update application status
    await application.update({ status: "approved" });

    // Create group chat
    const applicantIds = JSON.parse(application.applicantIds);
    const allUserIds = [userId, ...applicantIds];

    const chatRoom = await ChatRoom.create({
      listingId: application.listingId,
      isMatchmaking: false
    });

    // Add all users to the chat room
    await Promise.all(
      allUserIds.map(userId => 
        ChatRoomUser.create({
          chatRoomId: chatRoom.chatRoomId,
          userId,
          hasConsented: true,
          isChatVisible: true
        })
      )
    );

    // Create notifications for all applicants
    await Promise.all(
      applicantIds.map((applicantId: number) =>
        Notification.create({
          userId: applicantId,
          type: "application_approved",
          message: `Your application for "${listing.title || 'Apartment listing'}" has been approved!`,
          link: `/inbox?chatRoomId=${chatRoom.chatRoomId}`
        })
      )
    );

    res.json({
      message: "Application approved successfully",
      chatRoomId: chatRoom.chatRoomId
    });

  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject an application
export const rejectApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { applicationId } = req.params;

    // Get the application
    const application = await Application.findByPk(applicationId);
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Check if listing exists and user is the owner
    const listing = await Listing.findByPk(application.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (listing.userId !== userId) {
      res.status(403).json({ error: "Not authorized to reject this application" });
      return;
    }

    // Update application status
    await application.update({ status: "rejected" });

    // Create notifications for all applicants
    const applicantIds = JSON.parse(application.applicantIds);
    await Promise.all(
      applicantIds.map((applicantId: number) =>
        Notification.create({
          userId: applicantId,
          type: "application_rejected",
          message: `Your application for "${listing.title || 'Apartment listing'}" was not accepted.`,
          link: `/applications`
        })
      )
    );

    res.json({ message: "Application rejected successfully" });

  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific application
export const getApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { applicationId } = req.params;

    const application = await Application.findByPk(applicationId);
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Get listing details
    const listing = await Listing.findByPk(application.listingId, {
      include: [{ model: User, attributes: ["userId", "userFirstName", "userLastName"] }]
    });

    // Get applicant details
    const applicantIds = JSON.parse(application.applicantIds);
    const applicants = await User.findAll({
      where: { userId: applicantIds },
      attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "email"]
    });

    // Check if user is authorized to view this application
    const isOwner = listing?.userId === userId;
    const isApplicant = applicantIds.includes(userId);

    if (!isOwner && !isApplicant) {
      res.status(403).json({ error: "Not authorized to view this application" });
      return;
    }

    res.json({
      ...application.toJSON(),
      listing,
      applicants
    });

  } catch (error) {
    console.error("Error getting application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 