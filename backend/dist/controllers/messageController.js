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
exports.markMessagesAsSeen = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const sequelize_1 = require("sequelize");
// ... existing code ...
const markMessagesAsSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatRoomId, userId } = req.body;
    console.log('[markMessagesAsSeen] called with chatRoomId:', chatRoomId, 'userId:', userId);
    if (!userId || !chatRoomId) {
        console.log('[markMessagesAsSeen] Missing userId or chatRoomId');
        return res.status(400).json({ message: 'userId and chatRoomId are required' });
    }
    try {
        const [updated] = yield Message_1.default.update({ seen: true }, {
            where: {
                chatRoomId,
                userId: { [sequelize_1.Op.ne]: userId },
                seen: false,
            },
        });
        console.log(`[markMessagesAsSeen] Updated ${updated} messages as seen`);
        res.status(200).json({ message: 'Messages marked as seen', updated });
    }
    catch (error) {
        console.error('[markMessagesAsSeen] Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.markMessagesAsSeen = markMessagesAsSeen;
