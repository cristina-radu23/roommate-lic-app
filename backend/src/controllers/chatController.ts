import { Request, Response } from "express";
import ChatRoom from "../models/ChatRoom";
import ChatRoomUser from "../models/ChatRoomUser";
import Message from "../models/Message";
import Like from "../models/Like";
import User from "../models/User";
import { Op } from 'sequelize';

interface MessageWithUser {
  messageId: number;
  userId: number;
  content: string;
  createdAt: Date;
  User?: {
    userFirstName: string;
    userLastName: string;
    profilePicture?: string | null;
    isActive: boolean;
  };
}

interface ChatRoomUserWithUser {
  userId: number;
  User?: {
    userId: number;
    userFirstName: string;
    userLastName: string;
    profilePicture?: string | null;
    isActive: boolean;
  };
}

interface ChatRoomWithUsers {
  chatRoomId: number;
  ChatRoomUsers: ChatRoomUserWithUser[];
}

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
        ChatRoomUser.create({ 
          chatRoomId: chatRoom.chatRoomId, 
          userId, 
          hasConsented: !isMatchmaking,
          isChatVisible: true 
        })
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
    const message = await Message.create({ chatRoomId, userId, content, seen: false });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get all chat rooms for a user
export const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log('Fetching chat rooms for userId:', userId);
    // Find all chat rooms the user is part of, including all users in each chat
    const chatRoomUsers = await ChatRoomUser.findAll({
      where: { userId },
      include: [
        {
          model: ChatRoom,
          include: [
            {
              model: ChatRoomUser,
              include: [{
                model: User,
                attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture', 'isActive']
              }],
            },
          ],
        },
      ],
    });

    // For each chat, fetch the last message and attach as lastMessage, and count unread messages
    const chatRoomUsersWithLastMessage = await Promise.all(chatRoomUsers.map(async (chatRoomUser: any) => {
      const chatRoomId = chatRoomUser.ChatRoom?.chatRoomId;
      let lastMessage = null;
      let unreadCount = 0;
      if (chatRoomId) {
        lastMessage = await Message.findOne({
          where: { chatRoomId },
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture', 'isActive']
          }]
        });
        // Count unseen messages from other users
        unreadCount = await Message.count({
          where: {
            chatRoomId,
            userId: { [Op.ne]: Number(userId) },
            seen: false,
          },
        });
      }

      // Process the chat room data to handle inactive users' profile pictures
      const chatRoomData = chatRoomUser.toJSON();
      if (chatRoomData.ChatRoom?.ChatRoomUsers) {
        chatRoomData.ChatRoom.ChatRoomUsers = chatRoomData.ChatRoom.ChatRoomUsers.map((cru: ChatRoomUserWithUser) => {
          if (cru.User) {
            cru.User.profilePicture = cru.User.isActive ? cru.User.profilePicture : null;
          }
          return cru;
        });
      }

      // Handle last message user's profile picture
      if (lastMessage) {
        const messageData = lastMessage.toJSON() as unknown as MessageWithUser;
        if (messageData.User) {
          messageData.User.profilePicture = messageData.User.isActive ? messageData.User.profilePicture : null;
        }
        return {
          ...chatRoomData,
          lastMessage: messageData,
          unreadCount,
          isChatVisible: chatRoomUser.isChatVisible,
        };
      }

      return {
        ...chatRoomData,
        lastMessage: null,
        unreadCount,
        isChatVisible: chatRoomUser.isChatVisible,
      };
    }));

    console.log('Found chat rooms:', chatRoomUsersWithLastMessage.length);
    res.json(chatRoomUsersWithLastMessage);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
};

// Get all messages in a chat room
export const getChatRoomMessages = async (req: Request, res: Response) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.findAll({ 
      where: { chatRoomId }, 
      order: [["createdAt", "ASC"]], 
      include: [{
        model: User,
        attributes: ['userFirstName', 'userLastName', 'profilePicture', 'isActive']
      }] 
    });

    // Process messages to handle inactive users' profile pictures
    const processedMessages = messages.map(message => {
      const messageData = message.toJSON() as unknown as MessageWithUser;
      if (messageData.User) {
        messageData.User.profilePicture = messageData.User.isActive ? messageData.User.profilePicture : null;
      }
      return messageData;
    });

    res.json(processedMessages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}; 