"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cityRoutes.ts
const express_1 = __importDefault(require("express"));
const cityController_1 = require("../controllers/cityController");
const router = express_1.default.Router();
router.get("/", cityController_1.getCities);
exports.default = router;
