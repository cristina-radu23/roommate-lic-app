import { Request, Response } from "express";
import Like from "../models/Like";

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