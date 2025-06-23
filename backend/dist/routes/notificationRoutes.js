"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// GET /api/notifications/:userId
router.get("/:userId", notificationController_1.getAllNotifications);
// GET /api/notifications/:userId/unread
router.get("/:userId/unread", notificationController_1.getUnreadNotifications);
// POST /api/notifications/:userId/:notificationId/read
router.post("/:userId/:notificationId/read", notificationController_1.markAsRead);
// POST /api/notifications (for testing/demo)
router.post("/", notificationController_1.createNotification);
exports.default = router;
