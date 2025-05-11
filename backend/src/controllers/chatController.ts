import { Request, Response } from "express";
import ChatRoom from "../models/ChatRoom";
import ChatRoomUser from "../models/ChatRoomUser";
import Message from "../models/Message";
import Like from "../models/Like";
import User from "../models/User";

// Create a chat room (user-owner or matchmaking)
export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const { listingId, userIds, isMatchmaking } = req.body;
    if (!listingId || !Array.isArray(userIds) || userIds.length < 2) {
      res.status(400).json({ error: "listingId and at least two userIds required" });
      return;
    }
    // Check for existing chat room between these users (regardless of listing)
    const existingRooms = await ChatRoom.findAll({
      include: [{
        model: ChatRoomUser,
        where: { userId: userIds },
        required: true
      }]
    });
    // Find a room with exactly these two users
    const foundRoom = existingRooms.find(room => {
      const users = (room as any).ChatRoomUsers || (room as any).chat_room_users || [];
      const roomUserIds = users.map((u: any) => u.userId).sort();
      return roomUserIds.length === userIds.length &&
        roomUserIds.every((id: number, idx: number) => id === userIds.sort()[idx]);
    });
    if (foundRoom) {
      res.status(200).json({ chatRoomId: foundRoom.chatRoomId, existing: true });
      return;
    }
    const chatRoom = await ChatRoom.create({ listingId, isMatchmaking: !!isMatchmaking });
    await Promise.all(
      userIds.map((userId: number) =>
        ChatRoomUser.create({ chatRoomId: chatRoom.chatRoomId, userId, hasConsented: !isMatchmaking })
      )
    );
    res.status(201).json({ chatRoomId: chatRoom.chatRoomId });
    return;
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat room" });
  }
};

// User consents to matchmaking chat
export const consentToChat = async (req: Request, res: Response) => {
  try {
    const { chatRoomId, userId } = req.body;
    const chatRoomUser = await ChatRoomUser.findOne({ where: { chatRoomId, userId } });
    if (!chatRoomUser) {
      res.status(404).json({ error: "ChatRoomUser not found" });
      return;
    }
    chatRoomUser.hasConsented = true;
    await chatRoomUser.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to consent to chat" });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatRoomId, userId, content } = req.body;
    if (!content) {
      res.status(400).json({ error: "Message content required" });
      return;
    }
    const message = await Message.create({ chatRoomId, userId, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get all chat rooms for a user
export const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // Find all chat rooms the user is part of, including all users in each chat
    const chatRoomUsers = await ChatRoomUser.findAll({
      where: { userId },
      include: [
        {
          model: ChatRoom,
          include: [
            {
              model: ChatRoomUser,
              include: [User],
            },
          ],
        },
      ],
    });
    res.json(chatRoomUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat rooms" });
  }
};

// Get all messages in a chat room
export const getChatRoomMessages = async (req: Request, res: Response) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.findAll({ where: { chatRoomId }, order: [["createdAt", "ASC"]], include: [User] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}; 