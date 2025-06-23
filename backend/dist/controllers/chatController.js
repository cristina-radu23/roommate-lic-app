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
exports.getChatRoomMessages = exports.getUserChatRooms = exports.sendMessage = exports.consentToChat = exports.createChatRoom = void 0;
const ChatRoom_1 = __importDefault(require("../models/ChatRoom"));
const ChatRoomUser_1 = __importDefault(require("../models/ChatRoomUser"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
// Create a chat room (user-owner or matchmaking)
const createChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listingId, userIds, isMatchmaking } = req.body;
        if (!listingId || !Array.isArray(userIds) || userIds.length < 2) {
            res.status(400).json({ error: "listingId and at least two userIds required" });
            return;
        }
        // Check for existing chat room between these users (regardless of listing)
        const existingRooms = yield ChatRoom_1.default.findAll({
            include: [{
                    model: ChatRoomUser_1.default,
                    where: { userId: userIds },
                    required: true
                }]
        });
        // Find a room with exactly these two users
        const foundRoom = existingRooms.find(room => {
            const users = room.ChatRoomUsers || room.chat_room_users || [];
            const roomUserIds = users.map((u) => u.userId).sort();
            return roomUserIds.length === userIds.length &&
                roomUserIds.every((id, idx) => id === userIds.sort()[idx]);
        });
        if (foundRoom) {
            res.status(200).json({ chatRoomId: foundRoom.chatRoomId, existing: true });
            return;
        }
        const chatRoom = yield ChatRoom_1.default.create({ listingId, isMatchmaking: !!isMatchmaking });
        yield Promise.all(userIds.map((userId) => ChatRoomUser_1.default.create({
            chatRoomId: chatRoom.chatRoomId,
            userId,
            hasConsented: !isMatchmaking,
            isChatVisible: true
        })));
        res.status(201).json({ chatRoomId: chatRoom.chatRoomId });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create chat room" });
    }
});
exports.createChatRoom = createChatRoom;
// User consents to matchmaking chat
const consentToChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatRoomId, userId } = req.body;
        const chatRoomUser = yield ChatRoomUser_1.default.findOne({ where: { chatRoomId, userId } });
        if (!chatRoomUser) {
            res.status(404).json({ error: "ChatRoomUser not found" });
            return;
        }
        chatRoomUser.hasConsented = true;
        yield chatRoomUser.save();
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to consent to chat" });
    }
});
exports.consentToChat = consentToChat;
// Send a message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatRoomId, userId, content } = req.body;
        if (!content) {
            res.status(400).json({ error: "Message content required" });
            return;
        }
        const message = yield Message_1.default.create({ chatRoomId, userId, content, seen: false });
        res.status(201).json(message);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to send message" });
    }
});
exports.sendMessage = sendMessage;
// Get all chat rooms for a user
const getUserChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        console.log('Fetching chat rooms for userId:', userId);
        // Find all chat rooms the user is part of, including all users in each chat
        const chatRoomUsers = yield ChatRoomUser_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: ChatRoom_1.default,
                    include: [
                        {
                            model: ChatRoomUser_1.default,
                            include: [{
                                    model: User_1.default,
                                    attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture', 'isActive']
                                }],
                        },
                    ],
                },
            ],
        });
        // For each chat, fetch the last message and attach as lastMessage, and count unread messages
        const chatRoomUsersWithLastMessage = yield Promise.all(chatRoomUsers.map((chatRoomUser) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const chatRoomId = (_a = chatRoomUser.ChatRoom) === null || _a === void 0 ? void 0 : _a.chatRoomId;
            let lastMessage = null;
            let unreadCount = 0;
            if (chatRoomId) {
                lastMessage = yield Message_1.default.findOne({
                    where: { chatRoomId },
                    order: [['createdAt', 'DESC']],
                    include: [{
                            model: User_1.default,
                            attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture', 'isActive']
                        }]
                });
                // Count unseen messages from other users
                unreadCount = yield Message_1.default.count({
                    where: {
                        chatRoomId,
                        userId: { [sequelize_1.Op.ne]: Number(userId) },
                        seen: false,
                    },
                });
            }
            // Process the chat room data to handle inactive users' profile pictures
            const chatRoomData = chatRoomUser.toJSON();
            if ((_b = chatRoomData.ChatRoom) === null || _b === void 0 ? void 0 : _b.ChatRoomUsers) {
                chatRoomData.ChatRoom.ChatRoomUsers = chatRoomData.ChatRoom.ChatRoomUsers.map((cru) => {
                    if (cru.User) {
                        cru.User.profilePicture = cru.User.isActive ? cru.User.profilePicture : null;
                    }
                    return cru;
                });
            }
            // Handle last message user's profile picture
            if (lastMessage) {
                const messageData = lastMessage.toJSON();
                if (messageData.User) {
                    messageData.User.profilePicture = messageData.User.isActive ? messageData.User.profilePicture : null;
                }
                return Object.assign(Object.assign({}, chatRoomData), { lastMessage: messageData, unreadCount, isChatVisible: chatRoomUser.isChatVisible });
            }
            return Object.assign(Object.assign({}, chatRoomData), { lastMessage: null, unreadCount, isChatVisible: chatRoomUser.isChatVisible });
        })));
        console.log('Found chat rooms:', chatRoomUsersWithLastMessage.length);
        res.json(chatRoomUsersWithLastMessage);
    }
    catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
});
exports.getUserChatRooms = getUserChatRooms;
// Get all messages in a chat room
const getChatRoomMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatRoomId } = req.params;
        const messages = yield Message_1.default.findAll({
            where: { chatRoomId },
            order: [["createdAt", "ASC"]],
            include: [{
                    model: User_1.default,
                    attributes: ['userFirstName', 'userLastName', 'profilePicture', 'isActive']
                }]
        });
        // Process messages to handle inactive users' profile pictures
        const processedMessages = messages.map(message => {
            const messageData = message.toJSON();
            if (messageData.User) {
                messageData.User.profilePicture = messageData.User.isActive ? messageData.User.profilePicture : null;
            }
            return messageData;
        });
        res.json(processedMessages);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});
exports.getChatRoomMessages = getChatRoomMessages;
