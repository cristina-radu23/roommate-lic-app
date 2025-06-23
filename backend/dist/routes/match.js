"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const matchController_1 = require("../controllers/matchController");
const router = express_1.default.Router();
router.post("/", (req, res) => { void (0, matchController_1.createOrUpdateMatch)(req, res); });
router.delete("/", (req, res) => { void (0, matchController_1.removeMatch)(req, res); });
router.get("/user/:userId", (req, res) => { void (0, matchController_1.getUserMatches)(req, res); });
exports.default = router;
