import express from "express";
import {
  createChatRoom,
  consentToChat,
  sendMessage,
  getUserChatRooms,
  getChatRoomMessages,
} from "../controllers/chatController";

const router = express.Router();

router.post("/create", createChatRoom);
router.post("/consent", consentToChat);
router.post("/message", sendMessage);
router.get("/user/:userId", getUserChatRooms);
router.get("/room/:chatRoomId/messages", getChatRoomMessages);

export default router; 