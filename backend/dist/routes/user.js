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
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const upload_1 = __importDefault(require("../middleware/upload"));
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const router = express_1.default.Router();
router.post("/register", userController_1.createAccount);
router.post("/verify-email", userController_1.verifyEmail);
router.post("/resend-verification", userController_1.resendVerificationEmail);
router.post("/login", userController_1.loginUser);
router.get("/me", authMiddleware_1.default, (req, res) => { (0, userController_1.getCurrentUser)(req, res); });
router.post("/me/deactivate", authMiddleware_1.default, (req, res) => { (0, userController_1.deactivateUserAccount)(req, res); });
router.get("/:userId", (req, res) => { (0, userController_1.getUserById)(req, res); });
// Add profile picture upload endpoint
router.post("/upload-profile-picture", authMiddleware_1.default, upload_1.default.single('profilePicture'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const profilePictureUrl = `/uploads/${req.file.filename}`;
        // Update user's profile picture in database
        yield User_1.default.update({ profilePicture: profilePictureUrl }, { where: { userId } });
        res.json({ url: profilePictureUrl });
    }
    catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
}));
// Update current user profile
router.put("/me", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { userFirstName, userLastName, phoneNumber, bio, gender, dateOfBirth, occupation } = req.body;
        const [updated] = yield User_1.default.update({ userFirstName, userLastName, phoneNumber, bio, gender, dateOfBirth, occupation }, { where: { userId } });
        if (updated) {
            const updatedUser = yield User_1.default.findByPk(userId, {
                attributes: ["userFirstName", "userLastName", "email", "phoneNumber", "profilePicture", "bio", "gender", "dateOfBirth", "occupation"]
            });
            res.json(updatedUser);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}));
// Change password endpoint
router.post("/change-password", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Missing fields' });
            return;
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }
        const newHash = yield bcrypt_1.default.hash(newPassword, 10);
        user.passwordHash = newHash;
        yield user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
}));
// Delete account endpoint
router.delete("/me", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('[DELETE /me] Endpoint hit');
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log('[DELETE /me] userId:', userId);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Delete user's profile picture if exists
        const user = yield User_1.default.findByPk(userId);
        console.log('[DELETE /me] User found:', user ? user.toJSON() : null);
        if (user === null || user === void 0 ? void 0 : user.profilePicture) {
            const filename = user.profilePicture.split('/').pop();
            console.log('[DELETE /me] profilePicture filename:', filename);
            if (filename) {
                const filePath = path_1.default.join(__dirname, '../../uploads', filename);
                console.log('[DELETE /me] Attempting to delete file:', filePath);
                try {
                    yield promises_1.default.unlink(filePath);
                    console.log('[DELETE /me] File deleted successfully');
                }
                catch (err) {
                    console.error('[DELETE /me] Error deleting profile picture:', err);
                }
            }
        }
        // Delete user from database
        const destroyResult = yield User_1.default.destroy({ where: { userId } });
        console.log('[DELETE /me] User.destroy result:', destroyResult);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('[DELETE /me] Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account', details: error instanceof Error ? error.message : error });
    }
}));
exports.default = router;
