import { Request, Response } from "express";
import { RoommateAnnouncement, User, UserProfile, Photo } from "../models";
import { Op } from "sequelize";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    [key: string]: any;
  };
}

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      title,
      description,
      budgetMin,
      budgetMax,
      moveInDate,
      leaseDuration,
      preferredGender,
      userOccupation,
      userAgeMin,
      userAgeMax,
      smokingStatus,
      petStatus,
      cleanlinessAttitude,
      noiseAttitude,
      studyHabits,
      socialAttitude,
      locationAreas,
      mustHaveAmenities,
      dealBreakers,
      // New fields from form
      fullName,
      age,
      gender,
      preferredGenderArr,
      lookingFor,
      preferredLocations,
      occupation,
      occupationOther,
      workSchedule,
      smoking,
      drinking,
      hasPets,
      petType,
      okayWithPets,
      cleanlinessLevelNum,
      socialPreferenceRaw,
      noiseLevelRaw,
      sleepSchedule,
      visitorsOften,
      languages,
      culturalBackground,
      hobbies,
      bio,
      photos = [],
    } = req.body;

    console.log('Received roommate announcement request body:', req.body);

    // Set expiration date to 3 months from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const announcement = await RoommateAnnouncement.create({
      userId,
      title,
      description,
      budgetMin,
      budgetMax,
      moveInDate,
      leaseDuration,
      preferredGender,
      userOccupation,
      userAgeMin,
      userAgeMax,
      smokingStatus,
      petStatus,
      cleanlinessAttitude,
      noiseAttitude,
      studyHabits,
      socialAttitude,
      locationAreas: JSON.stringify(locationAreas),
      mustHaveAmenities: JSON.stringify(mustHaveAmenities),
      dealBreakers: JSON.stringify(dealBreakers),
      expiresAt,
      // New fields
      fullName,
      age,
      gender,
      preferredGenderArr: JSON.stringify(preferredGenderArr),
      lookingFor,
      preferredLocations: JSON.stringify(preferredLocations),
      occupation,
      occupationOther,
      workSchedule: JSON.stringify(workSchedule),
      smoking,
      drinking,
      hasPets,
      petType,
      okayWithPets,
      cleanlinessLevelNum,
      socialPreferenceRaw,
      noiseLevelRaw,
      sleepSchedule,
      visitorsOften,
      languages: JSON.stringify(languages),
      culturalBackground,
      hobbies: JSON.stringify(hobbies),
      bio,
    });

    console.log('Created roommate announcement:', announcement.toJSON());

    // Save photos in Photo table
    if (photos && Array.isArray(photos)) {
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        await Photo.create({
          announcementId: announcement.announcementId,
          url,
          order: i,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, filters } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      expiresAt: {
        [Op.gt]: new Date(),
      },
    };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Add filters
    if (filters) {
      const filterObj = JSON.parse(filters as string);
      if (filterObj.locationAreas) {
        console.log('[Roommate] locationAreas filter:', filterObj.locationAreas);
      }
      Object.keys(filterObj).forEach((key) => {
        if (filterObj[key] && filterObj[key] !== "any") {
          if (key === "locationAreas") {
            const value = filterObj[key];
            if (Array.isArray(value)) {
              whereClause.locationAreas = { [Op.or]: value.map(city => ({ [Op.like]: `%${city}%` })) };
            } else {
              whereClause.locationAreas = { [Op.like]: `%${value}%` };
            }
          } else {
            whereClause[key] = filterObj[key];
          }
        }
      });
      console.log('[Roommate] Final whereClause:', JSON.stringify(whereClause, null, 2));
    }

    const announcements = await RoommateAnnouncement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture"],
        },
        {
          model: Photo,
          attributes: ["photoId", "url", "order"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    // Parse JSON fields for each announcement
    const parsedAnnouncements = announcements.rows.map((a) => {
      const ann = a.toJSON();
      // Always provide photos as an array
      (ann as any).photos = Array.isArray((ann as any).Photos) ? (ann as any).Photos : ((ann as any).Photos ? [(ann as any).Photos] : []);
      delete (ann as any).Photos;
      // Parse all JSON fields
      const jsonFields = [
        'locationAreas', 'mustHaveAmenities', 'dealBreakers',
        'preferredGenderArr', 'preferredLocations', 'workSchedule', 'languages', 'hobbies'
      ];
      for (const field of jsonFields) {
        if (typeof (ann as any)[field] === 'string') {
          try { (ann as any)[field] = JSON.parse((ann as any)[field]); } catch { (ann as any)[field] = []; }
        }
      }
      return ann;
    });

    res.json({
      success: true,
      data: parsedAnnouncements,
      pagination: {
        total: announcements.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(announcements.count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await RoommateAnnouncement.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "bio"],
        },
        {
          model: Photo,
          attributes: ["photoId", "url", "order"],
        },
      ],
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Always provide photos as an array
    const ann = (announcement as any).toJSON();
    (ann as any).photos = Array.isArray((ann as any).Photos) ? (ann as any).Photos : ((ann as any).Photos ? [(ann as any).Photos] : []);
    delete (ann as any).Photos;
    // Parse all JSON fields
    const jsonFields = [
      'locationAreas', 'mustHaveAmenities', 'dealBreakers',
      'locationPreferences', 'mustHaveAmenities', 'dealBreakers',
      'preferredGenderArr', 'preferredLocations', 'workSchedule', 'languages', 'hobbies'
    ];
    for (const field of jsonFields) {
      if (typeof (ann as any)[field] === 'string') {
        try { (ann as any)[field] = JSON.parse((ann as any)[field]); } catch { (ann as any)[field] = []; }
      }
    }

    res.json({
      success: true,
      data: ann,
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
    });
  }
};

export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const announcement = await RoommateAnnouncement.findOne({
      where: { announcementId: id, userId },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or unauthorized",
      });
    }

    // Handle JSON fields
    if (updateData.locationPreferences) {
      updateData.locationPreferences = JSON.stringify(updateData.locationPreferences);
    }
    if (updateData.mustHaveAmenities) {
      updateData.mustHaveAmenities = JSON.stringify(updateData.mustHaveAmenities);
    }
    if (updateData.dealBreakers) {
      updateData.dealBreakers = JSON.stringify(updateData.dealBreakers);
    }

    await announcement.update(updateData);

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { id } = req.params;

    const announcement = await RoommateAnnouncement.findOne({
      where: { announcementId: id, userId },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or unauthorized",
      });
    }

    // Delete all photos associated with this announcement first
    await Photo.destroy({ where: { announcementId: announcement.announcementId } });
    console.log(`Deleted photos for announcement ${id}`);

    // Now delete the announcement itself
    await announcement.destroy();
    console.log(`Deleted announcement ${id}`);

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

export const getUserAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const announcements = await RoommateAnnouncement.findAll({
      where: { userId },
      include: [
        {
          model: Photo,
          attributes: ["photoId", "url", "order"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Parse JSON fields and format photos for each announcement
    const parsedAnnouncements = announcements.map((a) => {
      const ann = a.toJSON();
      // Always provide photos as an array
      (ann as any).photos = Array.isArray((ann as any).Photos) ? (ann as any).Photos : ((ann as any).Photos ? [(ann as any).Photos] : []);
      delete (ann as any).Photos;
      // Parse all JSON fields
      const jsonFields = [
        'locationPreferences', 'mustHaveAmenities', 'dealBreakers',
        'preferredGenderArr', 'preferredLocations', 'workSchedule', 'languages', 'hobbies'
      ];
      for (const field of jsonFields) {
        if (typeof (ann as any)[field] === 'string') {
          try { (ann as any)[field] = JSON.parse((ann as any)[field]); } catch { (ann as any)[field] = []; }
        }
      }
      return ann;
    });

    res.json({
      success: true,
      data: parsedAnnouncements,
    });
  } catch (error) {
    console.error("Error fetching user announcements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user announcements",
    });
  }
};

export const getMatchingAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get user's profile
    const userProfile = await UserProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "userFirstName", "userLastName", "gender", "occupation", "dateOfBirth"],
        },
      ],
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please complete your profile first.",
      });
    }

    // Calculate user's age
    const userAge = new Date().getFullYear() - new Date((userProfile as any).user.dateOfBirth).getFullYear();

    // Build matching criteria
    const whereClause: any = {
      expiresAt: {
        [Op.gt]: new Date(),
      },
      userId: {
        [Op.ne]: userId, // Exclude user's own announcements
      },
    };

    // Gender preference
    if ((userProfile as any).user.gender !== "not specified") {
      whereClause.preferredGender = {
        [Op.or]: ["any", (userProfile as any).user.gender],
      };
    }

    // Occupation preference
    if ((userProfile as any).user.occupation !== "not specified") {
      whereClause.preferredOccupation = {
        [Op.or]: ["any", (userProfile as any).user.occupation],
      };
    }

    // Age preference
    whereClause.preferredAgeMin = {
      [Op.lte]: userAge,
    };
    whereClause.preferredAgeMax = {
      [Op.gte]: userAge,
    };

    // Smoking preference
    whereClause.smokingPreference = {
      [Op.or]: ["any", userProfile.smokingStatus],
    };

    // Pet preference
    whereClause.petPreference = {
      [Op.or]: ["any", userProfile.hasPets ? "pet-friendly" : "no-pets"],
    };

    const announcements = await RoommateAnnouncement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    // Calculate compatibility scores
    const announcementsWithScores = announcements.rows.map((announcement) => {
      const score = calculateCompatibilityScore(userProfile, announcement);
      return {
        ...announcement.toJSON(),
        compatibilityScore: score,
      };
    });

    // Sort by compatibility score
    announcementsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      data: announcementsWithScores,
      pagination: {
        total: announcements.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(announcements.count / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching matching announcements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch matching announcements",
    });
  }
};

// Helper function to calculate compatibility score
const calculateCompatibilityScore = (userProfile: any, announcement: any): number => {
  let score = 0;
  const maxScore = 100;

  // Cleanliness compatibility (20 points)
  if (userProfile.cleanlinessLevel === announcement.cleanlinessLevel) {
    score += 20;
  } else if (
    (userProfile.cleanlinessLevel === "moderate" && announcement.cleanlinessLevel !== "very-clean") ||
    (announcement.cleanlinessLevel === "moderate" && userProfile.cleanlinessLevel !== "very-clean")
  ) {
    score += 10;
  }

  // Noise level compatibility (20 points)
  if (userProfile.noiseLevel === announcement.noiseLevel) {
    score += 20;
  } else if (
    (userProfile.noiseLevel === "moderate" && announcement.noiseLevel !== "quiet") ||
    (announcement.noiseLevel === "moderate" && userProfile.noiseLevel !== "quiet")
  ) {
    score += 10;
  }

  // Study habits compatibility (15 points)
  if (userProfile.studyHabits === announcement.studyHabits) {
    score += 15;
  } else if (
    (userProfile.studyHabits === "moderate-study" && announcement.studyHabits !== "quiet-study") ||
    (announcement.studyHabits === "moderate-study" && userProfile.studyHabits !== "quiet-study")
  ) {
    score += 7;
  }

  // Social preference compatibility (15 points)
  if (userProfile.socialPreference === announcement.socialPreference) {
    score += 15;
  } else if (
    (userProfile.socialPreference === "ambivert" && announcement.socialPreference !== "introvert") ||
    (announcement.socialPreference === "ambivert" && userProfile.socialPreference !== "introvert")
  ) {
    score += 7;
  }

  // Budget compatibility (20 points)
  const userBudgetRange = JSON.parse(userProfile.budgetRange);
  const userBudgetMin = userBudgetRange.min;
  const userBudgetMax = userBudgetRange.max;

  if (
    userBudgetMin <= announcement.budgetMax &&
    userBudgetMax >= announcement.budgetMin
  ) {
    const overlap = Math.min(userBudgetMax, announcement.budgetMax) - Math.max(userBudgetMin, announcement.budgetMin);
    const totalRange = Math.max(userBudgetMax, announcement.budgetMax) - Math.min(userBudgetMin, announcement.budgetMin);
    const budgetScore = (overlap / totalRange) * 20;
    score += budgetScore;
  }

  // Location compatibility (10 points)
  const userPreferredAreas = JSON.parse(userProfile.preferredAreas);
  const announcementLocations = JSON.parse(announcement.locationPreferences);
  
  const commonAreas = userPreferredAreas.filter((area: string) => 
    announcementLocations.includes(area)
  );
  
  if (commonAreas.length > 0) {
    score += (commonAreas.length / Math.max(userPreferredAreas.length, announcementLocations.length)) * 10;
  }

  return Math.round(score);
}; 