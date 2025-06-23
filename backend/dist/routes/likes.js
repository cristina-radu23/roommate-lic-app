"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const likeController_1 = require("../controllers/likeController");
const router = express_1.default.Router();
router.post("/", likeController_1.addLike);
router.delete("/", likeController_1.removeLike);
router.get("/:userId", likeController_1.getUserLikes);
router.get("/listing/:listingId/users", likeController_1.getListingLikes);
exports.default = router;
