import express from "express";
import { addLike, removeLike, getUserLikes } from "../controllers/likeController";

const router = express.Router();

router.post("/", addLike);
router.delete("/", removeLike);
router.get("/:userId", getUserLikes);

export default router; 