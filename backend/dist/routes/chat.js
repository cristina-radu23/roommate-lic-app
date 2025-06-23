"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.post("/create", chatController_1.createChatRoom);
router.post("/consent", chatController_1.consentToChat);
router.post("/message", chatController_1.sendMessage);
router.get("/user/:userId", chatController_1.getUserChatRooms);
router.get("/room/:chatRoomId/messages", chatController_1.getChatRoomMessages);
exports.default = router;
