import { Request, Response } from "express";
import { Notification, User } from "../models";

export const getAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }
    const notifications = await Notification.findAll({
      where: { userId, read: false },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// For testing/demo: create a notification
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, message, link } = req.body;
    if (!userId || !type || !message) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }
    const notification = await Notification.create({ userId, type, message, link });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
}; 