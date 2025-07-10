import express from "express";
import { createOrUpdateMatch, removeMatch, getUserMatches, getAllUserMatches, checkMatchExists, getAnnouncementMatch, getUserPairMatch } from "../controllers/matchController";

const router = express.Router();

router.post("/", (req, res) => { void createOrUpdateMatch(req, res); });
router.delete("/", (req, res) => { void removeMatch(req, res); });
router.post("/unmatch", (req, res) => { void removeMatch(req, res); }); // Add unmatch endpoint
router.get("/user/:userId", (req, res) => { void getUserMatches(req, res); });
router.get("/user/:userId/all", (req, res) => { void getAllUserMatches(req, res); });
router.get("/exists", (req, res) => { void checkMatchExists(req, res); });
router.get("/announcement-match", (req, res) => { void getAnnouncementMatch(req, res); });
router.get("/user-pair-match", (req, res) => { void getUserPairMatch(req, res); });

export default router; 