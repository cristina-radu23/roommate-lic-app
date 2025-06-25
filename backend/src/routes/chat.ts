import express from "express";
import * as chatController from "../controllers/chatController";

const router = express.Router();

router.post("/create", chatController.createChatRoom);
router.post("/consent", chatController.consentToChat);
router.post("/message", chatController.sendMessage);
router.get("/user/:userId", chatController.getUserChatRooms);
router.get("/room/:chatRoomId/messages", chatController.getChatRoomMessages);
// @ts-ignore
router.post("/from-match", chatController.getOrCreateChatRoomFromMatch);

export default router; 