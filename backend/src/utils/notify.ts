import Notification from "../models/Notification";

export async function sendNotification(userId: number, type: string, message: string, link?: string) {
  return Notification.create({ userId, type, message, link });
} 