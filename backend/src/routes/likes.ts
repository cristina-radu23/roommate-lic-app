import express from "express";
import { addLike, removeLike, getUserLikes, getListingLikes } from "../controllers/likeController";

const router = express.Router();

router.post("/", addLike);
router.delete("/", removeLike);
router.get("/:userId", getUserLikes);
router.get("/listing/:listingId/users", getListingLikes);

export default router; 