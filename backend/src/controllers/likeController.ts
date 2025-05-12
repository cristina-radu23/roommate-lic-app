import { Request, Response } from "express";
import Like from "../models/Like";
import User from "../models/User";

export const addLike = async (req: Request, res: Response) => {
  try {
    const { userId, listingId } = req.body;
    if (!userId || !listingId) {
      res.status(400).json({ error: "userId and listingId required" });
      return;
    }
    const [like, created] = await Like.findOrCreate({ where: { userId, listingId } });
    res.status(created ? 201 : 200).json(like);
    return;
  } catch (err) {
    res.status(500).json({ error: "Failed to add like" });
    return;
  }
};

export const removeLike = async (req: Request, res: Response) => {
  try {
    const { userId, listingId } = req.body;
    if (!userId || !listingId) {
      res.status(400).json({ error: "userId and listingId required" });
      return;
    }
    const deleted = await Like.destroy({ where: { userId, listingId } });
    res.json({ success: !!deleted });
    return;
  } catch (err) {
    res.status(500).json({ error: "Failed to remove like" });
    return;
  }
};

export const getUserLikes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }
    const likes = await Like.findAll({ where: { userId } });
    res.json(likes);
    return;
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch likes" });
    return;
  }
};

export const getListingLikes = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    if (!listingId) {
      res.status(400).json({ error: "listingId required" });
      return;
    }

    const likes = await Like.findAll({
      where: { listingId },
      include: [{
        model: User,
        attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture']
      }]
    });

    const users = likes.map(like => {
      if (!like.User) {
        console.error(`[getListingLikes] User not found for like ${like.likeId}`);
        return null;
      }
      console.log(`[getListingLikes] User: ${like.User.userFirstName} ${like.User.userLastName}, profilePicture: ${like.User.profilePicture}`);
      return {
        userId: like.User.userId,
        userFirstName: like.User.userFirstName,
        userLastName: like.User.userLastName,
        profilePicture: like.User.profilePicture
      };
    }).filter(user => user !== null);

    res.json(users);
    return;
  } catch (err) {
    console.error('[getListingLikes] Error:', err);
    res.status(500).json({ error: "Failed to fetch listing likes" });
    return;
  }
}; 