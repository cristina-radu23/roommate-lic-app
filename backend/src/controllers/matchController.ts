import { Request, Response } from "express";
import Match from "../models/Match";
import { Op } from "sequelize";

// Create or update a match (when a user clicks 'match')
export const createOrUpdateMatch = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId, listingId, actingUserId } = req.body;
    if (!userAId || !userBId || !listingId || !actingUserId) {
      return res.status(400).json({ error: "userAId, userBId, listingId, and actingUserId are required" });
    }
    // Always store userAId < userBId for uniqueness
    const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    const isA = actingUserId === firstId;
    let match = await Match.findOne({ where: { userAId: firstId, userBId: secondId, listingId } });
    if (!match) {
      match = await Match.create({
        userAId: firstId,
        userBId: secondId,
        listingId,
        userAConfirmed: isA,
        userBConfirmed: !isA ? true : false,
        isMatch: false
      });
    } else {
      if (isA) {
        match.userAConfirmed = true;
      } else {
        match.userBConfirmed = true;
      }
      match.isMatch = match.userAConfirmed && match.userBConfirmed;
      await match.save();
    }
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: "Failed to create or update match" });
  }
};

// Remove a match (if a user unlikes the listing)
export const removeMatch = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId, listingId } = req.body;
    if (!userAId || !userBId || !listingId) {
      return res.status(400).json({ error: "userAId, userBId, listingId are required" });
    }
    const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    await Match.destroy({ where: { userAId: firstId, userBId: secondId, listingId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove match" });
  }
};

// Get all matches for a user (where isMatch is true)
export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const matches = await Match.findAll({
      where: {
        isMatch: true,
        [Op.or]: [
          { userAId: userId },
          { userBId: userId }
        ]
      }
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}; 