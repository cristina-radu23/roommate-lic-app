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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markAsRead = exports.getUnreadNotifications = exports.getAllNotifications = void 0;
const models_1 = require("../models");
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }
        const notifications = yield models_1.Notification.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});
exports.getAllNotifications = getAllNotifications;
const getUnreadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }
        const notifications = yield models_1.Notification.findAll({
            where: { userId, read: false },
            order: [["createdAt", "DESC"]],
        });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch unread notifications" });
    }
});
exports.getUnreadNotifications = getUnreadNotifications;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const notification = yield models_1.Notification.findByPk(notificationId);
        if (!notification) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }
        notification.read = true;
        yield notification.save();
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to mark as read" });
    }
});
exports.markAsRead = markAsRead;
// For testing/demo: create a notification
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, type, message, link } = req.body;
        if (!userId || !type || !message) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }
        const notification = yield models_1.Notification.create({ userId, type, message, link });
        res.status(201).json(notification);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create notification" });
    }
});
exports.createNotification = createNotification;
