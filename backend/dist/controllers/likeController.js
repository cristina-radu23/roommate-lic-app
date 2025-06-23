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
exports.getListingLikes = exports.getUserLikes = exports.removeLike = exports.addLike = void 0;
const Like_1 = __importDefault(require("../models/Like"));
const User_1 = __importDefault(require("../models/User"));
const addLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, listingId } = req.body;
        if (!userId || !listingId) {
            res.status(400).json({ error: "userId and listingId required" });
            return;
        }
        const [like, created] = yield Like_1.default.findOrCreate({ where: { userId, listingId } });
        res.status(created ? 201 : 200).json(like);
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add like" });
        return;
    }
});
exports.addLike = addLike;
const removeLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, listingId } = req.body;
        if (!userId || !listingId) {
            res.status(400).json({ error: "userId and listingId required" });
            return;
        }
        const deleted = yield Like_1.default.destroy({ where: { userId, listingId } });
        res.json({ success: !!deleted });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to remove like" });
        return;
    }
});
exports.removeLike = removeLike;
const getUserLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: "userId required" });
            return;
        }
        const likes = yield Like_1.default.findAll({ where: { userId } });
        res.json(likes);
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch likes" });
        return;
    }
});
exports.getUserLikes = getUserLikes;
const getListingLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listingId } = req.params;
        if (!listingId) {
            res.status(400).json({ error: "listingId required" });
            return;
        }
        const likes = yield Like_1.default.findAll({
            where: { listingId },
            include: [{
                    model: User_1.default,
                    attributes: ['userId', 'userFirstName', 'userLastName', 'profilePicture']
                }]
        });
        const users = likes.map(like => {
            if (!like.User) {
                console.error(`[getListingLikes] User not found for like ${like.likeId}`);
                return null;
            }
            console.log(`[getListingLikes] User: ${like.User.userFirstName} ${like.User.userLastName}, profilePicture: ${like.User.profilePicture}`);
            return {
                userId: like.User.userId,
                userFirstName: like.User.userFirstName,
                userLastName: like.User.userLastName,
                profilePicture: like.User.profilePicture
            };
        }).filter(user => user !== null);
        res.json(users);
        return;
    }
    catch (err) {
        console.error('[getListingLikes] Error:', err);
        res.status(500).json({ error: "Failed to fetch listing likes" });
        return;
    }
});
exports.getListingLikes = getListingLikes;
