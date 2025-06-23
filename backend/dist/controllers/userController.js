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
exports.deactivateUserAccount = exports.deleteUserAccount = exports.getUserById = exports.getCurrentUser = exports.loginUser = exports.resendVerificationEmail = exports.verifyEmail = exports.createAccount = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const PendingRegistration_1 = __importDefault(require("../models/PendingRegistration"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Listing_1 = __importDefault(require("../models/Listing"));
const Like_1 = __importDefault(require("../models/Like"));
const Match_1 = __importDefault(require("../models/Match"));
const ChatRoom_1 = __importDefault(require("../models/ChatRoom"));
const ChatRoomUser_1 = __importDefault(require("../models/ChatRoomUser"));
const Message_1 = __importDefault(require("../models/Message"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Photo_1 = __importDefault(require("../models/Photo"));
const Address_1 = __importDefault(require("../models/Address"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sequelize_1 = require("sequelize");
const RoomAmenity_1 = __importDefault(require("../models/RoomAmenity"));
const PropertyAmenity_1 = __importDefault(require("../models/PropertyAmenity"));
const HouseRule_1 = __importDefault(require("../models/HouseRule"));
const db_1 = __importDefault(require("../config/db"));
const libphonenumber_js_1 = require("libphonenumber-js");
const emailService_1 = require("../services/emailService");
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userFirstName, userLastName, email, phoneNumber, dateOfBirth, gender, occupation, password, } = req.body;
        // Email format validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: "Invalid email format." });
            return;
        }
        // Phone number validation using libphonenumber-js
        console.log('Original phone number:', phoneNumber);
        let sanitizedPhone = phoneNumber.replace(/[^+\d]/g, '');
        if (!sanitizedPhone.startsWith('+')) {
            sanitizedPhone = '+' + sanitizedPhone;
        }
        console.log('Sanitized phone number (with +):', sanitizedPhone);
        const parsedPhone = (0, libphonenumber_js_1.parsePhoneNumberFromString)(sanitizedPhone);
        console.log('Parsed phone:', parsedPhone);
        if (!parsedPhone || !parsedPhone.isValid()) {
            res.status(400).json({ error: "Invalid phone number format." });
            return;
        }
        // Check if user already exists with same email
        const existingUserByEmail = yield User_1.default.findOne({ where: { email } });
        if (existingUserByEmail) {
            res.status(400).json({ error: "Email already registered." });
            return;
        }
        // Check if user already exists with same phone number
        const existingUserByPhone = yield User_1.default.findOne({ where: { phoneNumber } });
        if (existingUserByPhone) {
            res.status(400).json({ error: "Phone number already registered." });
            return;
        }
        // Check if there's already a pending registration for this email
        const existingPendingRegistration = yield PendingRegistration_1.default.findOne({ where: { email } });
        if (existingPendingRegistration) {
            // Delete the old pending registration
            yield existingPendingRegistration.destroy();
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const verificationCode = (0, emailService_1.generateVerificationCode)();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Store pending registration instead of creating user
        const pendingRegistration = yield PendingRegistration_1.default.create({
            userFirstName,
            userLastName,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
            occupation,
            passwordHash,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires
        });
        // Send verification email
        try {
            yield (0, emailService_1.sendVerificationEmail)(email, verificationCode, userFirstName);
            res.status(201).json({
                message: "Registration initiated. Please check your email for verification code.",
                pendingId: pendingRegistration.id,
                requiresVerification: true
            });
        }
        catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Delete the pending registration if email fails
            yield pendingRegistration.destroy();
            res.status(500).json({
                error: "Failed to send verification email. Please try again."
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Account creation failed." });
    }
});
exports.createAccount = createAccount;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('=== Email Verification Request ===');
        console.log('Request body:', req.body);
        const { email, verificationCode } = req.body;
        if (!email || !verificationCode) {
            console.log('Missing email or verification code');
            res.status(400).json({ error: "Email and verification code are required." });
            return;
        }
        console.log('Looking for pending registration with email:', email);
        const pendingRegistration = yield PendingRegistration_1.default.findOne({ where: { email } });
        if (!pendingRegistration) {
            console.log('Pending registration not found');
            res.status(404).json({ error: "No pending registration found for this email." });
            return;
        }
        console.log('Pending registration found:', {
            id: pendingRegistration.id,
            email: pendingRegistration.email,
            storedCode: pendingRegistration.emailVerificationCode,
            expires: pendingRegistration.emailVerificationExpires
        });
        console.log('Comparing codes:', {
            provided: verificationCode,
            stored: pendingRegistration.emailVerificationCode,
            match: pendingRegistration.emailVerificationCode === verificationCode
        });
        if (pendingRegistration.emailVerificationCode !== verificationCode) {
            console.log('Invalid verification code');
            res.status(400).json({ error: "Invalid verification code." });
            return;
        }
        if (pendingRegistration.emailVerificationExpires && new Date() > pendingRegistration.emailVerificationExpires) {
            console.log('Verification code expired');
            // Delete expired pending registration
            yield pendingRegistration.destroy();
            res.status(400).json({ error: "Verification code has expired. Please register again." });
            return;
        }
        console.log('Creating actual user account');
        // Create the actual user account
        const newUser = yield User_1.default.create({
            userFirstName: pendingRegistration.userFirstName,
            userLastName: pendingRegistration.userLastName,
            email: pendingRegistration.email,
            phoneNumber: pendingRegistration.phoneNumber,
            dateOfBirth: new Date(pendingRegistration.dateOfBirth),
            gender: pendingRegistration.gender,
            occupation: pendingRegistration.occupation,
            passwordHash: pendingRegistration.passwordHash,
            isActive: true,
            isEmailVerified: true,
            emailVerificationCode: undefined,
            emailVerificationExpires: undefined
        });
        // Delete the pending registration
        yield pendingRegistration.destroy();
        console.log('Email verification successful, user created:', newUser.userId);
        res.json({
            message: "Email verified successfully. Your account has been created.",
            userId: newUser.userId
        });
    }
    catch (err) {
        console.error('Error in verifyEmail:', err);
        res.status(500).json({ error: "Email verification failed." });
    }
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required." });
            return;
        }
        const pendingRegistration = yield PendingRegistration_1.default.findOne({ where: { email } });
        if (!pendingRegistration) {
            res.status(404).json({ error: "No pending registration found for this email." });
            return;
        }
        const verificationCode = (0, emailService_1.generateVerificationCode)();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield pendingRegistration.update({
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires
        });
        try {
            yield (0, emailService_1.sendVerificationEmail)(email, verificationCode, pendingRegistration.userFirstName);
            res.json({ message: "Verification email sent successfully." });
        }
        catch (emailError) {
            console.error('Error sending verification email:', emailError);
            res.status(500).json({ error: "Failed to send verification email." });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to resend verification email." });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield User_1.default.findOne({ where: { email } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }
    // If account was deactivated, reactivate it
    if (!user.isActive) {
        yield user.update({ isActive: true });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user.userId });
});
exports.loginUser = loginUser;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = yield User_1.default.findByPk(userId, {
            attributes: [
                "userFirstName",
                "userLastName",
                "email",
                "phoneNumber",
                "profilePicture",
                "bio",
                "gender",
                "dateOfBirth",
                "occupation"
            ]
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user info" });
    }
});
exports.getCurrentUser = getCurrentUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ error: "User ID is required" });
        const user = yield User_1.default.findByPk(userId, {
            attributes: [
                "userFirstName",
                "userLastName",
                "email",
                "phoneNumber",
                "profilePicture",
                "bio",
                "gender",
                "dateOfBirth"
            ]
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user info" });
    }
});
exports.getUserById = getUserById;
const deleteUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = yield db_1.default.transaction();
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // 1. Get user's listings first (we need this for chat rooms and likes)
        const listings = yield Listing_1.default.findAll({
            where: { userId },
            include: [
                { model: RoomAmenity_1.default },
                { model: PropertyAmenity_1.default },
                { model: HouseRule_1.default }
            ],
            transaction: t
        });
        const listingIds = listings.map(listing => listing.listingId);
        // 2. Delete all notifications first (they reference the user)
        yield Notification_1.default.destroy({
            where: { userId },
            transaction: t
        });
        // 3. Find all chat rooms where user is involved
        const chatRooms = yield ChatRoom_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { listingId: { [sequelize_1.Op.in]: listingIds } },
                    { '$ChatRoomUsers.userId$': userId }
                ]
            },
            include: [{
                    model: ChatRoomUser_1.default,
                    required: false
                }],
            transaction: t
        });
        const chatRoomIds = chatRooms.map(room => room.chatRoomId);
        // 4. Delete all messages in these chat rooms
        yield Message_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { chatRoomId: { [sequelize_1.Op.in]: chatRoomIds } },
                    { userId }
                ]
            },
            transaction: t
        });
        // 5. Delete chat room participations
        yield ChatRoomUser_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { chatRoomId: { [sequelize_1.Op.in]: chatRoomIds } },
                    { userId }
                ]
            },
            transaction: t
        });
        // 6. Delete chat rooms related to user's listings
        yield ChatRoom_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { listingId: { [sequelize_1.Op.in]: listingIds } },
                    { chatRoomId: { [sequelize_1.Op.in]: chatRoomIds } }
                ]
            },
            transaction: t
        });
        // 7. Delete all likes in both directions
        // First, delete likes given by the user
        yield Like_1.default.destroy({
            where: { userId },
            transaction: t
        });
        // Then, delete likes received on user's listings
        yield Like_1.default.destroy({
            where: { listingId: { [sequelize_1.Op.in]: listingIds } },
            transaction: t
        });
        // 8. Delete all matches where user is involved
        yield Match_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { userAId: userId },
                    { userBId: userId },
                    { listingId: { [sequelize_1.Op.in]: listingIds } }
                ]
            },
            transaction: t
        });
        // 9. For each listing, delete all dependencies first
        for (const listing of listings) {
            // Delete all photos for this listing
            yield Photo_1.default.destroy({
                where: { listingId: listing.listingId },
                transaction: t
            });
            // Remove all many-to-many associations
            yield listing.setRoomAmenities([]);
            yield listing.setPropertyAmenities([]);
            yield listing.setHouseRules([]);
        }
        // 10. Get all addresses associated with the listings
        const addresses = yield Address_1.default.findAll({
            where: {
                addressId: {
                    [sequelize_1.Op.in]: listings.map(listing => listing.addressId)
                }
            },
            transaction: t
        });
        // 11. Now that all dependencies are deleted, delete all listings
        yield Listing_1.default.destroy({
            where: { userId },
            transaction: t
        });
        // 12. Delete all addresses associated with the listings
        yield Address_1.default.destroy({
            where: {
                addressId: {
                    [sequelize_1.Op.in]: addresses.map(address => address.addressId)
                }
            },
            transaction: t
        });
        // 13. Delete user's profile picture if exists
        const user = yield User_1.default.findByPk(userId, { transaction: t });
        if (user === null || user === void 0 ? void 0 : user.profilePicture) {
            const filename = user.profilePicture.split('/').pop();
            if (filename) {
                const filePath = path_1.default.join(__dirname, '../../uploads', filename);
                try {
                    yield promises_1.default.unlink(filePath);
                }
                catch (err) {
                    console.error('Error deleting profile picture:', err);
                }
            }
        }
        // 14. Finally, delete the user
        yield User_1.default.destroy({
            where: { userId },
            transaction: t
        });
        // Commit the transaction
        yield t.commit();
        res.json({ message: 'Account and all related data deleted successfully' });
    }
    catch (error) {
        // Rollback the transaction in case of error
        yield t.rollback();
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account', details: error instanceof Error ? error.message : error });
    }
});
exports.deleteUserAccount = deleteUserAccount;
const deactivateUserAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        yield user.update({ isActive: false });
        res.json({ message: 'Account deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating account:', error);
        res.status(500).json({ error: 'Failed to deactivate account' });
    }
});
exports.deactivateUserAccount = deactivateUserAccount;
