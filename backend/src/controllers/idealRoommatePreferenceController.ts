import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import IdealRoommatePreference from "../models/IdealRoommatePreference";
import RoommateAnnouncement from "../models/RoommateAnnouncement";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import { Op } from "sequelize";
import Photo from "../models/Photo";

// Create or update ideal roommate preferences
export const createOrUpdatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      preferredAgeMin,
      preferredAgeMax,
      preferredGender,
      arrangementTypes,
      moveInDate,
      budgetMin,
      budgetMax,
      preferredLocations,
      preferredOccupationTypes,
      preferredWorkSchedules,
      smokingPreference,
      petPreference,
      cleanlinessPreference,
      sociabilityPreference,
      noiseLevelPreference,
      sleepSchedulePreference,
      guestPreference,
      preferredLanguages,
      openToAnyBackground,
      culturalComments,
      sharedInterests,
      additionalRequirements,
    } = req.body;

    // Check if preferences already exist
    const existingPreferences = await IdealRoommatePreference.findOne({
      where: { userId }
    });

    const preferenceData = {
      userId,
      preferredAgeMin,
      preferredAgeMax,
      preferredGender,
      arrangementTypes: JSON.stringify(arrangementTypes),
      moveInDate,
      budgetMin,
      budgetMax,
      preferredLocations: JSON.stringify(preferredLocations),
      preferredOccupationTypes: JSON.stringify(preferredOccupationTypes),
      preferredWorkSchedules: JSON.stringify(preferredWorkSchedules),
      smokingPreference,
      petPreference,
      cleanlinessPreference,
      sociabilityPreference,
      noiseLevelPreference,
      sleepSchedulePreference,
      guestPreference,
      preferredLanguages: JSON.stringify(preferredLanguages),
      openToAnyBackground,
      culturalComments,
      sharedInterests: JSON.stringify(sharedInterests),
      additionalRequirements,
      isComplete: true,
    };

    let preferences;
    if (existingPreferences) {
      preferences = await existingPreferences.update(preferenceData);
    } else {
      preferences = await IdealRoommatePreference.create(preferenceData);
    }

    res.status(200).json({
      success: true,
      data: preferences,
      message: existingPreferences ? "Preferences updated successfully" : "Preferences created successfully"
    });
  } catch (error) {
    console.error("Error creating/updating preferences:", error);
    res.status(500).json({ error: "Failed to save preferences" });
  }
};

// Get user's ideal roommate preferences
export const getUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const preferences = await IdealRoommatePreference.findOne({
      where: { userId },
      include: [{ model: User, as: "user", attributes: ["userId", "userFirstName", "userLastName"] }]
    });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found" });
    }

    // Parse JSON fields
    const parsedPreferences = {
      ...preferences.toJSON(),
      arrangementTypes: JSON.parse(preferences.arrangementTypes),
      preferredLocations: JSON.parse(preferences.preferredLocations),
      preferredOccupationTypes: JSON.parse(preferences.preferredOccupationTypes),
      preferredWorkSchedules: JSON.parse(preferences.preferredWorkSchedules),
      preferredLanguages: JSON.parse(preferences.preferredLanguages),
      sharedInterests: JSON.parse(preferences.sharedInterests),
    };

    res.status(200).json({
      success: true,
      data: parsedPreferences
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

// Get recommended roommate announcements based on ML compatibility
export const getRecommendedAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user's ideal roommate preferences
    const userPreferences = await IdealRoommatePreference.findOne({
      where: { userId, isComplete: true }
    });

    // Get user's matches to use as reference if no preferences
    let referenceProfiles = [];
    if (!userPreferences) {
      // TODO: Implement match-based recommendations
      // For now, return empty array if no preferences
      return res.status(200).json({
        success: true,
        data: [],
        message: "No preferences found. Please complete your ideal roommate form first."
      });
    }

    // Get all active roommate announcements
    const announcements = await RoommateAnnouncement.findAll({
      where: { 
        isActive: true,
        userId: { [Op.ne]: userId } // Exclude user's own announcements
      },
      include: [
        { model: User, as: "user", attributes: ["userId", "userFirstName", "userLastName", "profilePicture"] },
        { model: Photo, attributes: ["photoId", "url", "order"] },
      ],
      order: [["createdAt", "DESC"]]
    });

    // Calculate compatibility scores and format photos
    const scoredAnnouncements = announcements.map(announcement => {
      const ann = (announcement as any).toJSON();
      // Always provide photos as an array
      (ann as any).photos = Array.isArray((ann as any).Photos) ? (ann as any).Photos : ((ann as any).Photos ? [(ann as any).Photos] : []);
      delete (ann as any).Photos;
      const score = calculateCompatibilityScore(userPreferences, ann);
      return {
        ...ann,
        compatibilityScore: score
      };
    });

    // Sort by compatibility score (highest first)
    scoredAnnouncements.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Parse JSON fields for each announcement
    const parsedAnnouncements = scoredAnnouncements.map(announcement => ({
      ...announcement,
      locationAreas: announcement.locationAreas ? JSON.parse(announcement.locationAreas) : [],
      mustHaveAmenities: announcement.mustHaveAmenities ? JSON.parse(announcement.mustHaveAmenities) : [],
      dealBreakers: announcement.dealBreakers ? JSON.parse(announcement.dealBreakers) : [],
      preferredLocations: announcement.preferredLocations ? JSON.parse(announcement.preferredLocations) : [],
      workSchedule: announcement.workSchedule ? JSON.parse(announcement.workSchedule) : [],
      languages: announcement.languages ? JSON.parse(announcement.languages) : [],
      hobbies: announcement.hobbies ? JSON.parse(announcement.hobbies) : [],
    }));

    res.status(200).json({
      success: true,
      data: parsedAnnouncements,
      message: `Found ${parsedAnnouncements.length} recommendations`
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};

// Check if user has completed ideal roommate form
export const checkPreferencesStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const preferences = await IdealRoommatePreference.findOne({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      data: {
        hasPreferences: !!preferences,
        isComplete: preferences?.isComplete || false
      }
    });
  } catch (error) {
    console.error("Error checking preferences status:", error);
    res.status(500).json({ error: "Failed to check preferences status" });
  }
};

// ML-based compatibility scoring algorithm
const calculateCompatibilityScore = (userPreferences: any, announcement: any): number => {
  let score = 0;
  const maxScore = 100;

  // Age compatibility (15 points)
  const announcementAge = announcement.age || 25; // Default age if not provided
  if (announcementAge >= userPreferences.preferredAgeMin && announcementAge <= userPreferences.preferredAgeMax) {
    score += 15;
  } else if (Math.abs(announcementAge - (userPreferences.preferredAgeMin + userPreferences.preferredAgeMax) / 2) <= 5) {
    score += 7;
  }

  // Gender compatibility (10 points)
  if (userPreferences.preferredGender === "no-preference" || 
      userPreferences.preferredGender === announcement.gender) {
    score += 10;
  }

  // Budget compatibility (20 points)
  const userBudgetMid = (userPreferences.budgetMin + userPreferences.budgetMax) / 2;
  const announcementBudgetMid = (announcement.budgetMin + announcement.budgetMax) / 2;
  const budgetDifference = Math.abs(userBudgetMid - announcementBudgetMid) / userBudgetMid;
  
  if (budgetDifference <= 0.1) {
    score += 20;
  } else if (budgetDifference <= 0.2) {
    score += 15;
  } else if (budgetDifference <= 0.3) {
    score += 10;
  } else if (budgetDifference <= 0.5) {
    score += 5;
  }

  // Location compatibility (15 points)
  let userLocations = userPreferences.preferredLocations;
  if (typeof userLocations === 'string') {
    try {
      userLocations = JSON.parse(userLocations);
    } catch {
      userLocations = [];
    }
  }
  if (!Array.isArray(userLocations)) userLocations = [];

  let announcementLocations = announcement.preferredLocations;
  if (typeof announcementLocations === 'string') {
    try {
      announcementLocations = JSON.parse(announcementLocations);
    } catch {
      announcementLocations = [];
    }
  }
  if (!Array.isArray(announcementLocations)) announcementLocations = [];

  const locationOverlap = userLocations.filter((loc: string) => 
    announcementLocations.some((annLoc: string) => 
      annLoc.toLowerCase().includes(loc.toLowerCase()) || 
      loc.toLowerCase().includes(annLoc.toLowerCase())
    )
  );
  
  if (locationOverlap.length > 0) {
    score += 15;
  } else if (userLocations.length === 0 || announcementLocations.length === 0) {
    score += 7; // Partial score if one party doesn't specify
  }

  // Cleanliness compatibility (15 points)
  const cleanlinessDiff = Math.abs(userPreferences.cleanlinessPreference - (announcement.cleanlinessLevelNum || 3));
  if (cleanlinessDiff === 0) {
    score += 15;
  } else if (cleanlinessDiff === 1) {
    score += 10;
  } else if (cleanlinessDiff === 2) {
    score += 5;
  }

  // Smoking compatibility (10 points)
  if (userPreferences.smokingPreference === "doesnt-matter" ||
      (userPreferences.smokingPreference === "no" && announcement.smoking === "no") ||
      (userPreferences.smokingPreference === "yes" && announcement.smoking === "yes")) {
    score += 10;
  }

  // Pet compatibility (10 points)
  if (userPreferences.petPreference === "depends" ||
      (userPreferences.petPreference === "yes" && announcement.okayWithPets === "yes") ||
      (userPreferences.petPreference === "no" && announcement.okayWithPets === "no")) {
    score += 10;
  }

  // Social compatibility (5 points)
  const userSocial = userPreferences.sociabilityPreference;
  const announcementSocial = announcement.socialPreferenceRaw;
  
  if (userSocial === "no-preference" ||
      (userSocial === "very-social" && announcementSocial === "very-social") ||
      (userSocial === "friendly-private" && announcementSocial === "moderate") ||
      (userSocial === "quiet-independent" && announcementSocial === "private")) {
    score += 5;
  }

  return Math.min(score, maxScore);
}; 