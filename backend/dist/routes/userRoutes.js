"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post('/register', userController_1.createAccount);
router.post('/verify-email', userController_1.verifyEmail);
router.post('/resend-verification', userController_1.resendVerificationEmail);
router.post('/login', userController_1.loginUser);
router.get('/me', authMiddleware_1.default, userController_1.getCurrentUser);
router.delete('/me', authMiddleware_1.default, userController_1.deleteUserAccount);
exports.default = router;
