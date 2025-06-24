import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getUserAnnouncements,
  getMatchingAnnouncements,
} from "../controllers/roommateAnnouncementController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", (req, res) => { getAnnouncements(req, res); });
router.get("/:id", (req, res) => { getAnnouncementById(req, res); });

// Protected routes
router.post("/", authenticateToken, (req, res) => { createAnnouncement(req as AuthenticatedRequest, res); });
router.put("/:id", authenticateToken, (req, res) => { updateAnnouncement(req as AuthenticatedRequest, res); });
router.delete("/:id", authenticateToken, (req, res) => { deleteAnnouncement(req as AuthenticatedRequest, res); });
router.get("/user/me", authenticateToken, (req, res) => { getUserAnnouncements(req as AuthenticatedRequest, res); });
router.get("/matching/me", authenticateToken, (req, res) => { getMatchingAnnouncements(req as AuthenticatedRequest, res); });

export default router; 