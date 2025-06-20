import { Request, Response } from "express";
import Match from "../models/Match";
import { Op } from "sequelize";
import { sendNotification } from "../utils/notify";
import User from "../models/User";
import Listing from "../models/Listing";

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
    const listing = await Listing.findByPk(listingId);
    const listingTitle = listing ? listing.title : "a listing";
    const userA = await User.findByPk(userAId);
    const userB = await User.findByPk(userBId);
    if (!match) {
      match = await Match.create({
        userAId: firstId,
        userBId: secondId,
        listingId,
        userAConfirmed: isA,
        userBConfirmed: !isA ? true : false,
        isMatch: false
      });
      // Notify the other user
      const otherUserId = isA ? secondId : firstId;
      const actingUser = isA ? userA : userB;
      if (actingUser && otherUserId) {
        const msg = `${actingUser.userFirstName} ${actingUser.userLastName} wants to match with you on '${listingTitle}'.`;
        console.log(`[Match] Notifying userId=${otherUserId} about match request from userId=${actingUser.userId} (${actingUser.userFirstName} ${actingUser.userLastName}) on listing '${listingTitle}'`);
        try {
          await sendNotification(
            otherUserId,
            "match",
            msg,
            `/listing/${listingId}`
          );
          console.log(`[Match] Notification sent to userId=${otherUserId}`);
        } catch (err) {
          console.error(`[Match] Failed to notify userId=${otherUserId}:`, err);
        }
      }
    } else {
      if (isA) {
        match.userAConfirmed = true;
      } else {
        match.userBConfirmed = true;
      }
      match.isMatch = match.userAConfirmed && match.userBConfirmed;
      await match.save();
      // If both confirmed, notify both users
      if (match.isMatch && userA && userB) {
        const msgA = `You have a new match with ${userB.userFirstName} ${userB.userLastName} on '${listingTitle}'.`;
        const msgB = `You have a new match with ${userA.userFirstName} ${userA.userLastName} on '${listingTitle}'.`;
        console.log(`[Match] Notifying userId=${userA.userId} and userId=${userB.userId} about confirmed match on listing '${listingTitle}'`);
        try {
          await Promise.all([
            sendNotification(
              userA.userId,
              "match-confirmed",
              msgA,
              `/listing/${listingId}`
            ),
            sendNotification(
              userB.userId,
              "match-confirmed",
              msgB,
              `/listing/${listingId}`
            )
          ]);
          console.log(`[Match] Match-confirmed notifications sent to userId=${userA.userId} and userId=${userB.userId}`);
        } catch (err) {
          console.error(`[Match] Failed to send match-confirmed notifications:`, err);
        }
      }
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