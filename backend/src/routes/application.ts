import express from "express";
import {
  createApplication,
  getApplicationsForListing,
  getApplicationsByUser,
  approveApplication,
  rejectApplication,
  getApplication
} from "../controllers/applicationController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// Create a new application
router.post("/", authenticateToken, createApplication);

// Get applications for a specific listing (for listing owner)
router.get("/listing/:listingId", authenticateToken, getApplicationsForListing);

// Get applications by user (for applicants)
router.get("/user", authenticateToken, getApplicationsByUser);

// Get a specific application
router.get("/:applicationId", authenticateToken, getApplication);

// Approve an application
router.put("/:applicationId/approve", authenticateToken, approveApplication);

// Reject an application
router.put("/:applicationId/reject", authenticateToken, rejectApplication);

export default router; 