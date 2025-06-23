"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const Message_1 = __importDefault(require("../models/Message"));
const ChatRoomUser_1 = __importDefault(require("../models/ChatRoomUser"));
const ChatRoom_1 = __importDefault(require("../models/ChatRoom"));
const User_1 = __importDefault(require("../models/User"));
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                socket.data = { userId: decoded.userId };
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        }));
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.data.userId} connected`);
            // Join user to their personal room
            socket.join(`user_${socket.data.userId}`);
            // Join chat rooms the user is part of
            this.joinUserChatRooms(socket.data.userId);
            // Handle new message
            socket.on('send_message', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { chatRoomId, content } = data;
                    // Save to database
                    const message = yield Message_1.default.create({
                        chatRoomId,
                        userId: socket.data.userId,
                        content,
                        seen: false
                    });
                    // Get user info for the message
                    const user = yield User_1.default.findByPk(socket.data.userId, {
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
                }
                catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('message_error', { error: 'Failed to send message' });
                }
            }));
            // Handle typing indicators
            socket.on('typing_start', (data) => {
                socket.to(`chat_${data.chatRoomId}`).emit('user_typing', {
                    userId: socket.data.userId,
                    chatRoomId: data.chatRoomId
                });
            });
            socket.on('typing_stop', (data) => {
                socket.to(`chat_${data.chatRoomId}`).emit('user_stop_typing', {
                    userId: socket.data.userId,
                    chatRoomId: data.chatRoomId
                });
            });
            // Handle message seen
            socket.on('mark_seen', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield Message_1.default.update({ seen: true }, {
                        where: {
                            chatRoomId: data.chatRoomId,
                            userId: { [sequelize_1.Op.ne]: socket.data.userId },
                            seen: false
                        }
                    });
                    // Notify sender that message was seen
                    this.io.to(`user_${data.senderId}`).emit('message_seen', {
                        chatRoomId: data.chatRoomId,
                        seenBy: socket.data.userId
                    });
                    console.log(`Messages marked as seen in chat ${data.chatRoomId} by user ${socket.data.userId}`);
                }
                catch (error) {
                    console.error('Error marking messages as seen:', error);
                }
            }));
            // Handle joining a specific chat room
            socket.on('join_chat', (data) => {
                socket.join(`chat_${data.chatRoomId}`);
                console.log(`User ${socket.data.userId} joined chat ${data.chatRoomId}`);
            });
            // Handle leaving a chat room
            socket.on('leave_chat', (data) => {
                socket.leave(`chat_${data.chatRoomId}`);
                console.log(`User ${socket.data.userId} left chat ${data.chatRoomId}`);
            });
            socket.on('disconnect', () => {
                console.log(`User ${socket.data.userId} disconnected`);
            });
        });
    }
    joinUserChatRooms(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRoomUsers = yield ChatRoomUser_1.default.findAll({
                    where: { userId },
                    include: [{ model: ChatRoom_1.default }]
                });
                chatRoomUsers.forEach((chatRoomUser) => {
                    this.io.sockets.sockets.forEach((socket) => {
                        if (socket.data.userId === userId) {
                            socket.join(`chat_${chatRoomUser.chatRoomId}`);
                        }
                    });
                });
                console.log(`User ${userId} joined ${chatRoomUsers.length} chat rooms`);
            }
            catch (error) {
                console.error('Error joining user to chat rooms:', error);
            }
        });
    }
    updateUnreadCount(chatRoomId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRoomUsers = yield ChatRoomUser_1.default.findAll({
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
            }
            catch (error) {
                console.error('Error updating unread count:', error);
            }
        });
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
