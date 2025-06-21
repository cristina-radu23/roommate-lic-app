import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import PendingRegistration from "../models/PendingRegistration";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Listing from "../models/Listing";
import Like from "../models/Like";
import Match from "../models/Match";
import ChatRoom from "../models/ChatRoom";
import ChatRoomUser from "../models/ChatRoomUser";
import Message from "../models/Message";
import Notification from "../models/Notification";
import Photo from "../models/Photo";
import Address from "../models/Address";
import path from "path";
import fs from "fs/promises";
import { Op } from "sequelize";
import RoomAmenity from "../models/RoomAmenity";
import PropertyAmenity from "../models/PropertyAmenity";
import HouseRule from "../models/HouseRule";
import sequelize from "../config/db";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { sendVerificationEmail, generateVerificationCode } from "../services/emailService";

export const createAccount = async (req: Request, res: Response): Promise<void>=> {
  try {
    const {
      userFirstName,
      userLastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      occupation,
      password,
    } = req.body;

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
    const parsedPhone = parsePhoneNumberFromString(sanitizedPhone);
    console.log('Parsed phone:', parsedPhone);
    if (!parsedPhone || !parsedPhone.isValid()) {
      res.status(400).json({ error: "Invalid phone number format." });
      return;
    }

    // Check if user already exists with same email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      res.status(400).json({ error: "Email already registered." });
      return;
    }

    // Check if user already exists with same phone number
    const existingUserByPhone = await User.findOne({ where: { phoneNumber } });
    if (existingUserByPhone) {
      res.status(400).json({ error: "Phone number already registered." });
      return;
    }

    // Check if there's already a pending registration for this email
    const existingPendingRegistration = await PendingRegistration.findOne({ where: { email } });
    if (existingPendingRegistration) {
      // Delete the old pending registration
      await existingPendingRegistration.destroy();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending registration instead of creating user
    const pendingRegistration = await PendingRegistration.create({
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
      await sendVerificationEmail(email, verificationCode, userFirstName);
      res.status(201).json({ 
        message: "Registration initiated. Please check your email for verification code.", 
        pendingId: pendingRegistration.id,
        requiresVerification: true
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Delete the pending registration if email fails
      await pendingRegistration.destroy();
      res.status(500).json({ 
        error: "Failed to send verification email. Please try again." 
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Account creation failed." });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
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
    const pendingRegistration = await PendingRegistration.findOne({ where: { email } });
    
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
      await pendingRegistration.destroy();
      res.status(400).json({ error: "Verification code has expired. Please register again." });
      return;
    }

    console.log('Creating actual user account');
    // Create the actual user account
    const newUser = await User.create({
      userFirstName: pendingRegistration.userFirstName,
      userLastName: pendingRegistration.userLastName,
      email: pendingRegistration.email,
      phoneNumber: pendingRegistration.phoneNumber,
      dateOfBirth: new Date(pendingRegistration.dateOfBirth),
      gender: pendingRegistration.gender as "male" | "female" | "not specified",
      occupation: pendingRegistration.occupation as "student" | "employeed" | "not specified",
      passwordHash: pendingRegistration.passwordHash,
      isActive: true,
      isEmailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExpires: undefined
    });

    // Delete the pending registration
    await pendingRegistration.destroy();

    console.log('Email verification successful, user created:', newUser.userId);
    res.json({ 
      message: "Email verified successfully. Your account has been created.",
      userId: newUser.userId
    });
  } catch (err) {
    console.error('Error in verifyEmail:', err);
    res.status(500).json({ error: "Email verification failed." });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const pendingRegistration = await PendingRegistration.findOne({ where: { email } });
    if (!pendingRegistration) {
      res.status(404).json({ error: "No pending registration found for this email." });
      return;
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pendingRegistration.update({
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    try {
      await sendVerificationEmail(email, verificationCode, pendingRegistration.userFirstName);
      res.json({ message: "Verification email sent successfully." });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ error: "Failed to send verification email." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend verification email." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // If account was deactivated, reactivate it
  if (!user.isActive) {
    await user.update({ isActive: true });
  }

  const token = jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.json({ token, userId: user.userId });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findByPk(userId, {
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await User.findByPk(userId, {
      attributes: [
        "userFirstName",
        "userLastName",
        "email",
        "phoneNumber",
        "profilePicture",
        "bio"
      ]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Get user's listings first (we need this for chat rooms and likes)
    const listings = await Listing.findAll({ 
      where: { userId },
      include: [
        { model: RoomAmenity },
        { model: PropertyAmenity },
        { model: HouseRule }
      ],
      transaction: t
    });
    const listingIds = listings.map(listing => listing.listingId);

    // 2. Delete all notifications first (they reference the user)
    await Notification.destroy({ 
      where: { userId },
      transaction: t
    });

    // 3. Find all chat rooms where user is involved
    const chatRooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { listingId: { [Op.in]: listingIds } },
          { '$ChatRoomUsers.userId$': userId }
        ]
      },
      include: [{
        model: ChatRoomUser,
        required: false
      }],
      transaction: t
    });

    const chatRoomIds = chatRooms.map(room => room.chatRoomId);

    // 4. Delete all messages in these chat rooms
    await Message.destroy({ 
      where: { 
        [Op.or]: [
          { chatRoomId: { [Op.in]: chatRoomIds } },
          { userId }
        ]
      },
      transaction: t
    });

    // 5. Delete chat room participations
    await ChatRoomUser.destroy({ 
      where: { 
        [Op.or]: [
          { chatRoomId: { [Op.in]: chatRoomIds } },
          { userId }
        ]
      },
      transaction: t
    });

    // 6. Delete chat rooms related to user's listings
    await ChatRoom.destroy({ 
      where: { 
        [Op.or]: [
          { listingId: { [Op.in]: listingIds } },
          { chatRoomId: { [Op.in]: chatRoomIds } }
        ]
      },
      transaction: t
    });

    // 7. Delete all likes in both directions
    // First, delete likes given by the user
    await Like.destroy({ 
      where: { userId },
      transaction: t
    });
    // Then, delete likes received on user's listings
    await Like.destroy({ 
      where: { listingId: { [Op.in]: listingIds } },
      transaction: t
    });

    // 8. Delete all matches where user is involved
    await Match.destroy({ 
      where: {
        [Op.or]: [
          { userAId: userId },
          { userBId: userId },
          { listingId: { [Op.in]: listingIds } }
        ]
      },
      transaction: t
    });
    
    // 9. For each listing, delete all dependencies first
    for (const listing of listings) {
      // Delete all photos for this listing
      await Photo.destroy({ 
        where: { listingId: listing.listingId },
        transaction: t
      });

      // Remove all many-to-many associations
      await listing.setRoomAmenities([]);
      await listing.setPropertyAmenities([]);
      await listing.setHouseRules([]);
    }

    // 10. Get all addresses associated with the listings
    const addresses = await Address.findAll({
      where: {
        addressId: {
          [Op.in]: listings.map(listing => listing.addressId)
        }
      },
      transaction: t
    });

    // 11. Now that all dependencies are deleted, delete all listings
    await Listing.destroy({ 
      where: { userId },
      transaction: t
    });

    // 12. Delete all addresses associated with the listings
    await Address.destroy({
      where: {
        addressId: {
          [Op.in]: addresses.map(address => address.addressId)
        }
      },
      transaction: t
    });

    // 13. Delete user's profile picture if exists
    const user = await User.findByPk(userId, { transaction: t });
    if (user?.profilePicture) {
      const filename = user.profilePicture.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads', filename);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting profile picture:', err);
        }
      }
    }

    // 14. Finally, delete the user
    await User.destroy({ 
      where: { userId },
      transaction: t
    });

    // Commit the transaction
    await t.commit();

    res.json({ message: 'Account and all related data deleted successfully' });
  } catch (error) {
    // Rollback the transaction in case of error
    await t.rollback();
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error instanceof Error ? error.message : error });
  }
};

export const deactivateUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await user.update({ isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
};