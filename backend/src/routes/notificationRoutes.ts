import express from "express";
import {
  getAllNotifications,
  getUnreadNotifications,
  markAsRead,
  createNotification,
} from "../controllers/notificationController";

const router = express.Router();

// GET /api/notifications/:userId
router.get("/:userId", getAllNotifications);

// GET /api/notifications/:userId/unread
router.get("/:userId/unread", getUnreadNotifications);

// POST /api/notifications/:userId/:notificationId/read
router.post("/:userId/:notificationId/read", markAsRead);

// POST /api/notifications (for testing/demo)
router.post("/", createNotification);

export default router; 