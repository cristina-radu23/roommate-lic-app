import express from "express";
import {
  createOrUpdatePreferences,
  getUserPreferences,
  getRecommendedAnnouncements,
  checkPreferencesStatus,
} from "../controllers/idealRoommatePreferenceController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create or update ideal roommate preferences
router.post("/", (req, res) => { createOrUpdatePreferences(req as AuthenticatedRequest, res); });

// Get user's ideal roommate preferences
router.get("/me", (req, res) => { getUserPreferences(req as AuthenticatedRequest, res); });

// Check if user has completed the form
router.get("/status", (req, res) => { checkPreferencesStatus(req as AuthenticatedRequest, res); });

// Get recommended roommate announcements
router.get("/recommendations", (req, res) => { getRecommendedAnnouncements(req as AuthenticatedRequest, res); });

export default router; 