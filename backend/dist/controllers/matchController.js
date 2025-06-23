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
exports.getUserMatches = exports.removeMatch = exports.createOrUpdateMatch = void 0;
const Match_1 = __importDefault(require("../models/Match"));
const sequelize_1 = require("sequelize");
const notify_1 = require("../utils/notify");
const User_1 = __importDefault(require("../models/User"));
const Listing_1 = __importDefault(require("../models/Listing"));
// Create or update a match (when a user clicks 'match')
const createOrUpdateMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userAId, userBId, listingId, actingUserId } = req.body;
        if (!userAId || !userBId || !listingId || !actingUserId) {
            return res.status(400).json({ error: "userAId, userBId, listingId, and actingUserId are required" });
        }
        // Get the listing to check if the acting user is the owner
        const listing = yield Listing_1.default.findByPk(listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        // Prevent the listing owner from matching with users who liked their listing
        if (listing.userId === actingUserId) {
            return res.status(403).json({ error: "Listing owners cannot match with users who liked their listing" });
        }
        // Always store userAId < userBId for uniqueness
        const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
        const isA = actingUserId === firstId;
        let match = yield Match_1.default.findOne({ where: { userAId: firstId, userBId: secondId, listingId } });
        const listingTitle = listing ? listing.title : "a listing";
        const userA = yield User_1.default.findByPk(userAId);
        const userB = yield User_1.default.findByPk(userBId);
        if (!match) {
            match = yield Match_1.default.create({
                userAId: firstId,
                userBId: secondId,
                listingId,
                userAConfirmed: isA,
                userBConfirmed: !isA ? true : false,
                isMatch: false
            });
            // Notify the other user
            const otherUserId = isA ? secondId : firstId;
            const actingUser = isA ? userA : userB;
            if (actingUser && otherUserId) {
                const msg = `${actingUser.userFirstName} ${actingUser.userLastName} wants to match with you on '${listingTitle}'.`;
                console.log(`[Match] Notifying userId=${otherUserId} about match request from userId=${actingUser.userId} (${actingUser.userFirstName} ${actingUser.userLastName}) on listing '${listingTitle}'`);
                try {
                    yield (0, notify_1.sendNotification)(otherUserId, "match", msg, `/listing/${listingId}`);
                    console.log(`[Match] Notification sent to userId=${otherUserId}`);
                }
                catch (err) {
                    console.error(`[Match] Failed to notify userId=${otherUserId}:`, err);
                }
            }
        }
        else {
            if (isA) {
                match.userAConfirmed = true;
            }
            else {
                match.userBConfirmed = true;
            }
            match.isMatch = match.userAConfirmed && match.userBConfirmed;
            yield match.save();
            // If both confirmed, notify both users
            if (match.isMatch && userA && userB) {
                const msgA = `You have a new match with ${userB.userFirstName} ${userB.userLastName} on '${listingTitle}'.`;
                const msgB = `You have a new match with ${userA.userFirstName} ${userA.userLastName} on '${listingTitle}'.`;
                console.log(`[Match] Notifying userId=${userA.userId} and userId=${userB.userId} about confirmed match on listing '${listingTitle}'`);
                try {
                    yield Promise.all([
                        (0, notify_1.sendNotification)(userA.userId, "match-confirmed", msgA, `/listing/${listingId}`),
                        (0, notify_1.sendNotification)(userB.userId, "match-confirmed", msgB, `/listing/${listingId}`)
                    ]);
                    console.log(`[Match] Match-confirmed notifications sent to userId=${userA.userId} and userId=${userB.userId}`);
                }
                catch (err) {
                    console.error(`[Match] Failed to send match-confirmed notifications:`, err);
                }
            }
        }
        res.json(match);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create or update match" });
    }
});
exports.createOrUpdateMatch = createOrUpdateMatch;
// Remove a match (if a user unlikes the listing)
const removeMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userAId, userBId, listingId } = req.body;
        if (!userAId || !userBId || !listingId) {
            return res.status(400).json({ error: "userAId, userBId, listingId are required" });
        }
        const [firstId, secondId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
        yield Match_1.default.destroy({ where: { userAId: firstId, userBId: secondId, listingId } });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to remove match" });
    }
});
exports.removeMatch = removeMatch;
// Get all matches for a user (where isMatch is true)
const getUserMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ error: "userId required" });
        const matches = yield Match_1.default.findAll({
            where: {
                isMatch: true,
                [sequelize_1.Op.or]: [
                    { userAId: userId },
                    { userBId: userId }
                ]
            }
        });
        res.json(matches);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});
exports.getUserMatches = getUserMatches;
