import { Request, Response } from "express";
import { UserProfile, User } from "../models";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    [key: string]: any;
  };
}

export const createUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      age,
      smokingStatus,
      hasPets,
      petDetails,
      cleanlinessLevel,
      noiseLevel,
      studyHabits,
      socialPreference,
      sleepSchedule,
      cookingHabits,
      guestPolicy,
      budgetRange,
      preferredAreas,
      mustHaveAmenities,
      dealBreakers,
      additionalInfo,
    } = req.body;

    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "User profile already exists. Use update endpoint instead.",
      });
    }

    const profile = await UserProfile.create({
      userId,
      age,
      smokingStatus,
      hasPets,
      petDetails,
      cleanlinessLevel,
      noiseLevel,
      studyHabits,
      socialPreference,
      sleepSchedule,
      cookingHabits,
      guestPolicy,
      budgetRange: JSON.stringify(budgetRange),
      preferredAreas: JSON.stringify(preferredAreas),
      mustHaveAmenities: JSON.stringify(mustHaveAmenities || []),
      dealBreakers: JSON.stringify(dealBreakers || []),
      additionalInfo,
      isProfileComplete: true,
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user profile",
    });
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const profile = await UserProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "bio"],
        },
      ],
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Parse JSON fields for frontend
    const profileData = profile.toJSON();
    profileData.budgetRange = JSON.parse(profileData.budgetRange);
    profileData.preferredAreas = JSON.parse(profileData.preferredAreas);
    profileData.mustHaveAmenities = JSON.parse(profileData.mustHaveAmenities);
    profileData.dealBreakers = JSON.parse(profileData.dealBreakers);

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const updateData = req.body;

    const profile = await UserProfile.findOne({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Handle JSON fields
    if (updateData.budgetRange) {
      updateData.budgetRange = JSON.stringify(updateData.budgetRange);
    }
    if (updateData.preferredAreas) {
      updateData.preferredAreas = JSON.stringify(updateData.preferredAreas);
    }
    if (updateData.mustHaveAmenities) {
      updateData.mustHaveAmenities = JSON.stringify(updateData.mustHaveAmenities);
    }
    if (updateData.dealBreakers) {
      updateData.dealBreakers = JSON.stringify(updateData.dealBreakers);
    }

    // Mark profile as complete if all required fields are present
    const requiredFields = [
      'age', 'smokingStatus', 'cleanlinessLevel', 'noiseLevel', 
      'studyHabits', 'socialPreference', 'sleepSchedule', 'cookingHabits', 
      'guestPolicy', 'budgetRange', 'preferredAreas'
    ] as const;
    
    const hasAllRequiredFields = requiredFields.every(field => 
      updateData[field] || profile.getDataValue(field as any)
    );
    
    if (hasAllRequiredFields) {
      updateData.isProfileComplete = true;
    }

    await profile.update(updateData);

    // Parse JSON fields for response
    const profileData = profile.toJSON();
    profileData.budgetRange = JSON.parse(profileData.budgetRange);
    profileData.preferredAreas = JSON.parse(profileData.preferredAreas);
    profileData.mustHaveAmenities = JSON.parse(profileData.mustHaveAmenities);
    profileData.dealBreakers = JSON.parse(profileData.dealBreakers);

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};

export const deleteUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const profile = await UserProfile.findOne({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    await profile.destroy();

    res.json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user profile",
    });
  }
};

export const checkProfileCompletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const profile = await UserProfile.findOne({
      where: { userId },
    });

    res.json({
      success: true,
      data: {
        hasProfile: !!profile,
        isComplete: profile?.isProfileComplete || false,
      },
    });
  } catch (error) {
    console.error("Error checking profile completion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check profile completion",
    });
  }
}; 