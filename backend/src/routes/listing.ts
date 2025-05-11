import express from "express";
import { createListing, getAllListings, getListingsByCity, getListingById, getUserListings } from "../controllers/listingController";
import authenticateToken from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import upload from '../middleware/upload';



const router = express.Router();

// Adapter to match Express RequestHandler
router.post("/", authenticateToken, (req, res): void => {
    void createListing(req as AuthenticatedRequest, res);
  });
  
router.get("/", getAllListings);
router.get("/by-city/:cityId", getListingsByCity);
router.get("/:id", (req, res) => { void getListingById(req, res); });
router.get("/user/listings", authenticateToken, (req, res) => { void getUserListings(req as AuthenticatedRequest, res); });

// Add this endpoint for photo upload
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});


export default router;
