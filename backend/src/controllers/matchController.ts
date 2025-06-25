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
    const { userAId, userBId, listingId, actingUserId } = req.body;
    if (!userAId || !userBId || !listingId || !actingUserId) {
      return res.status(400).json({ error: "userAId, userBId, listingId, and actingUserId are required" });
    }

    // Get the listing to check if the acting user is the owner
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Prevent the listing owner from matching with users who liked their listing
    if (listing.userId === actingUserId) {
      return res.status(403).json({ error: "Listing owners cannot match with users who liked their listing" });
    }

    // Always store userAId < userBId for uniqueness
    const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    let match = await Match.findOne({ where: { userAId: firstId, userBId: secondId, listingId } });
    const userA = await User.findByPk(userAId);
    const userB = await User.findByPk(userBId);
    // Fix: Use actingUserId to determine sender
    const actingUser = actingUserId === userAId ? userA : userB;
    const otherUserId = actingUserId === userAId ? userBId : userAId;
    const listingTitle = listing ? listing.title : "a listing";

    if (!match) {
      match = await Match.create({
        userAId: firstId,
        userBId: secondId,
        listingId,
        userAConfirmed: actingUserId === firstId,
        userBConfirmed: actingUserId === secondId,
        isMatch: false,
        initiatorId: actingUserId
      });
      // Notify the other user
      if (actingUser && otherUserId) {
        console.log('[Match][DEBUG]', {
          actingUserId: actingUser?.userId,
          actingUserName: `${actingUser?.userFirstName} ${actingUser?.userLastName}`,
          otherUserId,
          msg: `${actingUser.userFirstName} ${actingUser.userLastName} wants to match with you on '${listingTitle}'.`
        });
        const msg = `${actingUser.userFirstName} ${actingUser.userLastName} wants to match with you on '${listingTitle}'.`;
        console.log(`[Match] Notifying userId=${otherUserId} about match request from userId=${actingUser.userId} (${actingUser.userFirstName} ${actingUser.userLastName}) on listing '${listingTitle}'`);
        try {
          await sendNotification(
            otherUserId,
            "match",
            msg,
            `/account/${actingUserId}`
          );
          console.log(`[Match] Notification sent to userId=${otherUserId}`);
        } catch (err) {
          console.error(`[Match] Failed to notify userId=${otherUserId}:`, err);
        }
      }
    } else {
      if (actingUserId === match.userAId) {
        match.userAConfirmed = true;
      } else if (actingUserId === match.userBId) {
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

// Create or update a roommate match (when a user clicks 'match' on roommate announcement)
export const createOrUpdateRoommateMatch = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId, announcementId, actingUserId } = req.body;
    if (!userAId || !userBId || !actingUserId || !announcementId) {
      return res.status(400).json({ error: "userAId, userBId, announcementId, and actingUserId are required" });
    }

    // Validate announcement exists
    const announcement = await RoommateAnnouncement.findByPk(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    // Prevent the announcement owner from matching with themselves
    if (announcement.userId === actingUserId) {
      return res.status(403).json({ error: "Announcement owners cannot match with users who want to match with them" });
    }

    // Always store userAId < userBId for uniqueness
    const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    let match = await Match.findOne({ 
      where: { 
        userAId: firstId, 
        userBId: secondId, 
        announcementId: announcementId 
      } 
    });
    const userA = await User.findByPk(userAId);
    const userB = await User.findByPk(userBId);
    const actingUser = actingUserId === userAId ? userA : userB;
    const otherUserId = actingUserId === userAId ? userBId : userAId;
    const announcementTitle = announcement ? announcement.title : "a roommate announcement";

    if (!match) {
      match = await Match.create({
        userAId: firstId,
        userBId: secondId,
        listingId: null,
        announcementId: announcementId,
        userAConfirmed: actingUserId === firstId,
        userBConfirmed: actingUserId === secondId,
        isMatch: false,
        initiatorId: actingUserId
      });
      // Notify the other user
      if (actingUser && otherUserId) {
        const msg = `${actingUser.userFirstName} ${actingUser.userLastName} wants to match with you on '${announcementTitle}'.`;
        const notifLink = `/account/${actingUserId}`;
        console.log('[NOTIFY][REQUEST] Sending roommate-match notification', {
          to: otherUserId,
          from: actingUserId,
          notifLink,
          msg
        });
        try {
          await sendNotification(
            otherUserId,
            "roommate-match",
            msg,
            notifLink
          );
          console.log('[NOTIFY][SUCCESS] Roommate-match notification sent to', otherUserId);
        } catch (err) {
          console.error('[NOTIFY][ERROR] Failed to notify userId=' + otherUserId, err);
        }
      }
    } else {
      // Set confirmation based on initiator/receiver, not just userA/userB
      const actingId = Number(actingUserId);
      if (actingId === match.initiatorId) {
        if (match.userAId === match.initiatorId) {
          match.userAConfirmed = true;
        } else if (match.userBId === match.initiatorId) {
          match.userBConfirmed = true;
        }
      } else {
        if (match.userAId === actingId) {
          match.userAConfirmed = true;
        } else if (match.userBId === actingId) {
          match.userBConfirmed = true;
        }
      }
      match.isMatch = match.userAConfirmed && match.userBConfirmed;
      await match.save();
      // If both confirmed, notify both users
      if (match.isMatch && userA && userB) {
        const msgA = `You have a new roommate match with ${userB.userFirstName} ${userB.userLastName} on '${announcementTitle}'.`;
        const msgB = `You have a new roommate match with ${userA.userFirstName} ${userA.userLastName} on '${announcementTitle}'.`;
        const matchLinkA = `/account/${userB.userId}`;
        const matchLinkB = `/account/${userA.userId}`;
        console.log('[NOTIFY][REQUEST] Sending roommate-match-confirmed notifications', {
          toA: userA.userId,
          toB: userB.userId,
          matchLinkA,
          matchLinkB,
          msgA,
          msgB
        });
        try {
          await Promise.all([
            sendNotification(
              userA.userId,
              "roommate-match-confirmed",
              msgA,
              matchLinkA
            ),
            sendNotification(
              userB.userId,
              "roommate-match-confirmed",
              msgB,
              matchLinkB
            )
          ]);
          console.log('[NOTIFY][SUCCESS] Roommate-match-confirmed notifications sent to', userA.userId, 'and', userB.userId);
        } catch (err) {
          console.error('[NOTIFY][ERROR] Failed to send match-confirmed notifications:', err);
        }
      }
    }
    res.json(match);
  } catch (err) {
    console.error('[RoommateMatch] Error:', err);
    res.status(500).json({ error: "Failed to create or update roommate match" });
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

// Get all matches for a user
export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'UserA',
          attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture']
        },
        {
          model: User,
          as: 'UserB',
          attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user matches" });
  }
}; 