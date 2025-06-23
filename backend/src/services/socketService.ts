import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Message from '../models/Message';
import ChatRoomUser from '../models/ChatRoomUser';
import ChatRoom from '../models/ChatRoom';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
  };
}

export class SocketService {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.data = { userId: decoded.userId };
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`User ${socket.data.userId} connected`);

      // Join user to their personal room
      socket.join(`user_${socket.data.userId}`);

      // Join chat rooms the user is part of
      this.joinUserChatRooms(socket.data.userId);

      // Handle new message
      socket.on('send_message', async (data: { chatRoomId: number; content: string }) => {
        try {
          const { chatRoomId, content } = data;
          
          // Save to database
          const message = await Message.create({
            chatRoomId,
            userId: socket.data.userId,
            content,
            seen: false
          });

          // Get user info for the message
          const user = await User.findByPk(socket.data.userId, {
            attributes: ['userFirstName', 'userLastName', 'profilePicture', 'isActive']
          });

          const messageData = {
            messageId: message.messageId,
            userId: socket.data.userId,
            content,
            createdAt: message.createdAt,
            chatRoomId,
            User: user ? {
              userFirstName: user.userFirstName,
              userLastName: user.userLastName,
              profilePicture: user.isActive ? user.profilePicture : null,
              isActive: user.isActive
            } : null
          };

          // Emit to all users in the chat room
          this.io.to(`chat_${chatRoomId}`).emit('new_message', messageData);

          // Update unread count for other users
          this.updateUnreadCount(chatRoomId, socket.data.userId);

          console.log(`Message sent in chat ${chatRoomId} by user ${socket.data.userId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { chatRoomId: number }) => {
        socket.to(`chat_${data.chatRoomId}`).emit('user_typing', {
          userId: socket.data.userId,
          chatRoomId: data.chatRoomId
        });
      });

      socket.on('typing_stop', (data: { chatRoomId: number }) => {
        socket.to(`chat_${data.chatRoomId}`).emit('user_stop_typing', {
          userId: socket.data.userId,
          chatRoomId: data.chatRoomId
        });
      });

      // Handle message seen
      socket.on('mark_seen', async (data: { chatRoomId: number; senderId: number }) => {
        try {
          await Message.update(
            { seen: true },
            { 
              where: { 
                chatRoomId: data.chatRoomId,
                userId: { [Op.ne]: socket.data.userId },
                seen: false
              }
            }
          );

          // Notify sender that message was seen
          this.io.to(`user_${data.senderId}`).emit('message_seen', {
            chatRoomId: data.chatRoomId,
            seenBy: socket.data.userId
          });

          console.log(`Messages marked as seen in chat ${data.chatRoomId} by user ${socket.data.userId}`);
        } catch (error) {
          console.error('Error marking messages as seen:', error);
        }
      });

      // Handle joining a specific chat room
      socket.on('join_chat', (data: { chatRoomId: number }) => {
        socket.join(`chat_${data.chatRoomId}`);
        console.log(`User ${socket.data.userId} joined chat ${data.chatRoomId}`);
      });

      // Handle leaving a chat room
      socket.on('leave_chat', (data: { chatRoomId: number }) => {
        socket.leave(`chat_${data.chatRoomId}`);
        console.log(`User ${socket.data.userId} left chat ${data.chatRoomId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`);
      });
    });
  }

  private async joinUserChatRooms(userId: number) {
    try {
      const chatRoomUsers = await ChatRoomUser.findAll({
        where: { userId },
        include: [{ model: ChatRoom }]
      });

      chatRoomUsers.forEach((chatRoomUser: any) => {
        this.io.sockets.sockets.forEach((socket: any) => {
          if (socket.data.userId === userId) {
            socket.join(`chat_${chatRoomUser.chatRoomId}`);
          }
        });
      });

      console.log(`User ${userId} joined ${chatRoomUsers.length} chat rooms`);
    } catch (error) {
      console.error('Error joining user to chat rooms:', error);
    }
  }

  private async updateUnreadCount(chatRoomId: number, senderId: number) {
    try {
      const chatRoomUsers = await ChatRoomUser.findAll({
        where: { chatRoomId }
      });

      chatRoomUsers.forEach(chatRoomUser => {
        if (chatRoomUser.userId !== senderId) {
          this.io.to(`user_${chatRoomUser.userId}`).emit('unread_count_update', {
            chatRoomId,
            count: 1 // Increment by 1
          });
        }
      });
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  }

  public getIO() {
    return this.io;
  }
} 