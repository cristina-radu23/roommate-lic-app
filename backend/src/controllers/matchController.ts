import { Request, Response } from "express";
import Match from "../models/Match";
import { Op } from "sequelize";
import { sendNotification } from "../utils/notify";
import User from "../models/User";
import Listing from "../models/Listing";
import RoommateAnnouncement from "../models/RoommateAnnouncement";

// Create or update a match (when a user clicks 'match')
export const createOrUpdateMatch = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId, listingId, announcementId, actingUserId } = req.body;
    if (!userAId || !userBId || !actingUserId || (!listingId && !announcementId)) {
      return res.status(400).json({ error: "userAId, userBId, actingUserId, and either listingId or announcementId are required" });
    }
    if (listingId && announcementId) {
      return res.status(400).json({ error: "Provide only one of listingId or announcementId, not both" });
    }

    // For confirmation, use userAId and userBId from the request
    let match = await Match.findOne({ where: { userAId, userBId, listingId: listingId || null, announcementId: announcementId || null } });
    let reversed = false;
    if (!match) {
      match = await Match.findOne({ where: { userAId: userBId, userBId: userAId, listingId: listingId || null, announcementId: announcementId || null } });
      if (match) reversed = true;
    }
    const userA = await User.findByPk(userAId);
    const userB = await User.findByPk(userBId);
    const actingUser = await User.findByPk(actingUserId);
    console.log('[MatchController] userAId:', userAId, 'userBId:', userBId, 'actingUserId:', actingUserId, 'listingId:', listingId, 'announcementId:', announcementId);
    if (!match) {
      // Use the userBId from the request (the user next to whom "Match" was clicked)
      let contextTitle = "";
      let contextLink = "";
      if (listingId) {
        const listing = await Listing.findByPk(listingId);
        if (!listing) {
          return res.status(404).json({ error: "Listing not found" });
        }
        contextTitle = listing.title;
        contextLink = `/listing/${listingId}`;
      } else if (announcementId) {
        const announcement = await RoommateAnnouncement.findByPk(announcementId);
        if (!announcement) {
          return res.status(404).json({ error: "Announcement not found" });
        }
        contextTitle = announcement.title;
        contextLink = `/announcement/${announcementId}`;
      }
      
      if (actingUserId === userBId) {
        return res.status(400).json({ error: "Cannot create or confirm a match with yourself." });
      }
      
      const userAIdFinal = actingUserId;
      const userBIdFinal = userBId; // Use the userBId from the request
      console.log('[MatchController] Creating new match: userAId:', userAIdFinal, 'userBId:', userBIdFinal);
      match = await Match.create({
        userAId: userAIdFinal,
        userBId: userBIdFinal,
        listingId: listingId || null,
        announcementId: announcementId || null,
        userAConfirmed: true, // initiator always confirms
        userBConfirmed: false, // recipient must confirm
        isMatch: false
      });
      // Notify recipient (userB)
      if (userA && userB) {
        const msg = `${userA.userFirstName} ${userA.userLastName} wants to match with you on '${contextTitle}'.`;
        const profileLink = `/account/${userA.userId}`;
        console.log(`[Match] Notifying recipient (userB, userId=${userB.userId}) about match request from initiator (userA, userId=${userA.userId}) on '${contextTitle}'`);
        try {
          await sendNotification(
            userB.userId,
            "match",
            msg,
            profileLink
          );
          console.log(`[Match] Notification sent to recipient (userB, userId=${userB.userId})`);
        } catch (err) {
          console.error(`[Match] Failed to notify recipient (userB, userId=${userB.userId}):`, err);
        }
      }
    } else {
      // If already exists, update confirmation
      console.log('[MatchController] Before update:', JSON.stringify(match.toJSON()));
      if (!reversed) {
        if (Number(actingUserId) === match.userAId) {
          match.userAConfirmed = true;
        } else if (Number(actingUserId) === match.userBId) {
          match.userBConfirmed = true;
        }
      } else {
        // If found in reversed order, update accordingly
        if (Number(actingUserId) === match.userAId) {
          match.userAConfirmed = true;
        } else if (Number(actingUserId) === match.userBId) {
          match.userBConfirmed = true;
        }
      }
      match.isMatch = match.userAConfirmed && match.userBConfirmed;
      await match.save();
      console.log('[MatchController] After update:', JSON.stringify(match.toJSON()));
      // If both confirmed, notify both users
      if (match.isMatch && userA && userB) {
        const msgA = `You have a new match with ${userB.userFirstName} ${userB.userLastName} on '${match.announcementId ? match.announcementId : match.listingId}'.`;
        const msgB = `You have a new match with ${userA.userFirstName} ${userA.userLastName} on '${match.announcementId ? match.announcementId : match.listingId}'.`;
        console.log(`[Match] Notifying userId=${userA.userId} and userId=${userB.userId} about confirmed match.`);
        try {
          await Promise.all([
            sendNotification(
              userA.userId,
              "match-confirmed",
              msgA,
              `/account/${userB.userId}`
            ),
            sendNotification(
              userB.userId,
              "match-confirmed",
              msgB,
              `/account/${userA.userId}`
            )
          ]);
          console.log(`[Match] Match-confirmed notifications sent to userId=${userA.userId} and userId=${userB.userId}`);
        } catch (err) {
          console.error(`[Match] Failed to send match-confirmed notifications:`, err);
        }
      }
    }
    console.log('[MatchController] Returning match to client:', JSON.stringify(match.toJSON()));
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: "Failed to create or update match" });
  }
};

// Remove a match (if a user unlikes the listing or announcement)
export const removeMatch = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId, listingId, announcementId } = req.body;
    if (!userAId || !userBId || (!listingId && !announcementId)) {
      return res.status(400).json({ error: "userAId, userBId, and either listingId or announcementId are required" });
    }
    if (listingId && announcementId) {
      return res.status(400).json({ error: "Provide only one of listingId or announcementId, not both" });
    }
    // userAId = initiator, userBId = recipient
    await Match.destroy({ where: { userAId, userBId, listingId: listingId || null, announcementId: announcementId || null } });
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
      },
      include: [
        { model: User, as: 'UserA', attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture'] },
        { model: User, as: 'UserB', attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture'] }
      ]
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};

// Check if a match exists between two users for a given announcementId or listingId
export const checkMatchExists = async (req: Request, res: Response) => {
  try {
    let { userAId, userBId, listingId, announcementId } = req.query;
    if (!userAId || !userBId || (!listingId && !announcementId)) {
      return res.status(400).json({ error: "userAId, userBId, and either listingId or announcementId are required" });
    }
    if (listingId && announcementId) {
      return res.status(400).json({ error: "Provide only one of listingId or announcementId, not both" });
    }
    // userAId = initiator, userBId = recipient
    const match = await Match.findOne({
      where: {
        userAId: Number(userAId),
        userBId: Number(userBId),
        listingId: listingId ? Number(listingId) : null,
        announcementId: announcementId ? Number(announcementId) : null
      }
    });
    res.json({ exists: !!match });
  } catch (err) {
    res.status(500).json({ error: "Failed to check match existence" });
  }
};

// Get a match for a specific announcement and user pair (regardless of userA/userB)
export const getAnnouncementMatch = async (req: Request, res: Response) => {
  try {
    const { userId, announcementId } = req.query;
    if (!userId || !announcementId) {
      return res.status(400).json({ error: "userId and announcementId are required" });
    }
    // Find a match where either userAId or userBId is userId, and announcementId matches
    const match = await Match.findOne({
      where: {
        announcementId: Number(announcementId),
        [Op.or]: [
          { userAId: Number(userId) },
          { userBId: Number(userId) }
        ]
      }
    });
    // Fetch the announcement to get the post owner
    let postOwnerId = null;
    try {
      const RoommateAnnouncement = require('../models/RoommateAnnouncement').default;
      const announcement = await RoommateAnnouncement.findByPk(Number(announcementId));
      postOwnerId = announcement ? announcement.userId : null;
    } catch (e) {}
    console.log(`[AnnouncementMatch] authUserId=${userId}, postOwnerId=${postOwnerId}, matchId=${match ? match.matchId : 'none'}, isMatch=${match ? match.isMatch : 'n/a'}`);
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch match for announcement" });
  }
};

// Get a match for a user pair (initiator/recipient, regardless of listing or announcement)
export const getUserPairMatch = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.query;
    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "userId and otherUserId are required" });
    }
    console.log(`[getUserPairMatch] Searching for match between userId=${userId} and otherUserId=${otherUserId}`);
    
    // Try both directions: userId as initiator, otherUserId as recipient, and vice versa
    let match = await Match.findOne({
      where: {
        userAId: Number(userId),
        userBId: Number(otherUserId)
      }
    });
    console.log(`[getUserPairMatch] First search result:`, match ? match.toJSON() : 'null');
    
    if (!match) {
      match = await Match.findOne({
        where: {
          userAId: Number(otherUserId),
          userBId: Number(userId)
        }
      });
      console.log(`[getUserPairMatch] Second search result:`, match ? match.toJSON() : 'null');
    }
    
    // If still no match found, try to find any match between these users (regardless of listing/announcement)
    if (!match) {
      const allMatches = await Match.findAll({
        where: {
          [Op.or]: [
            { userAId: Number(userId), userBId: Number(otherUserId) },
            { userAId: Number(otherUserId), userBId: Number(userId) }
          ]
        }
      });
      console.log(`[getUserPairMatch] All matches found:`, allMatches.map(m => m.toJSON()));
      if (allMatches.length > 0) {
        match = allMatches[0]; // Return the first match found
        console.log(`[getUserPairMatch] Using first match:`, match.toJSON());
      }
    }
    
    console.log(`[getUserPairMatch] Final result:`, match ? match.toJSON() : 'null');
    res.json(match);
  } catch (err) {
    console.error(`[getUserPairMatch] Error:`, err);
    res.status(500).json({ error: "Failed to fetch match for user pair" });
  }
}; 