import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getUserAnnouncements,
  getMatchingAnnouncements,
  getUserAnnouncementsById,
} from "../controllers/roommateAnnouncementController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/user/me", authenticateToken, (req, res) => { getUserAnnouncements(req, res); });
router.get("/user/:userId", (req, res) => { getUserAnnouncementsById(req, res); });
router.get("/", (req, res) => { getAnnouncements(req, res); });
router.get("/:id", (req, res) => { getAnnouncementById(req, res); });

// Protected routes
router.post("/", authenticateToken, (req, res) => { createAnnouncement(req, res); });
router.put("/:id", authenticateToken, (req, res) => { updateAnnouncement(req, res); });
router.delete("/:id", authenticateToken, (req, res) => { deleteAnnouncement(req, res); });
router.get("/matching/me", authenticateToken, (req, res) => { getMatchingAnnouncements(req, res); });

export default router; 