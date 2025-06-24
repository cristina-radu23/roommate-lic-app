import express from "express";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  checkProfileCompletion,
} from "../controllers/userProfileController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.post("/", authenticateToken, (req, res) => { createUserProfile(req as AuthenticatedRequest, res); });
router.get("/me", authenticateToken, (req, res) => { getUserProfile(req as AuthenticatedRequest, res); });
router.put("/me", authenticateToken, (req, res) => { updateUserProfile(req as AuthenticatedRequest, res); });
router.delete("/me", authenticateToken, (req, res) => { deleteUserProfile(req as AuthenticatedRequest, res); });
router.get("/me/completion", authenticateToken, (req, res) => { checkProfileCompletion(req as AuthenticatedRequest, res); });

export default router; 