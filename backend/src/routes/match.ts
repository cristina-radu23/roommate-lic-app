import express from "express";
import { createOrUpdateMatch, removeMatch, getUserMatches, createOrUpdateRoommateMatch } from "../controllers/matchController";

const router = express.Router();

router.post("/", (req, res) => { void createOrUpdateMatch(req, res); });
router.post("/roommate", (req, res) => { void createOrUpdateRoommateMatch(req, res); });
router.delete("/", (req, res) => { void removeMatch(req, res); });
router.get("/user/:userId", (req, res) => { void getUserMatches(req, res); });

export default router; 