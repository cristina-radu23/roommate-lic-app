import express, { Response, Request } from "express";
import { createAccount, loginUser, getCurrentUser, getUserById, deactivateUserAccount } from "../controllers/userController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";
import upload from '../middleware/upload';
import User from '../models/User';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginUser);
router.get("/me", authenticateToken, (req, res) => { getCurrentUser(req as AuthenticatedRequest, res); });
router.post("/me/deactivate", authenticateToken, (req, res) => { deactivateUserAccount(req as AuthenticatedRequest, res); });
router.get("/:userId", (req: Request, res: Response) => { getUserById(req, res); });

// Add profile picture upload endpoint
router.post("/upload-profile-picture", authenticateToken, upload.single('profilePicture'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;
    
    // Update user's profile picture in database
    await User.update(
      { profilePicture: profilePictureUrl },
      { where: { userId } }
    );

    res.json({ url: profilePictureUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Update current user profile
router.put("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { userFirstName, userLastName, phoneNumber, bio, gender, dateOfBirth, occupation } = req.body;
    const [updated] = await User.update(
      { userFirstName, userLastName, phoneNumber, bio, gender, dateOfBirth, occupation },
      { where: { userId } }
    );
    if (updated) {
      const updatedUser = await User.findByPk(userId, {
        attributes: ["userFirstName", "userLastName", "email", "phoneNumber", "profilePicture", "bio", "gender", "dateOfBirth", "occupation"]
      });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password endpoint
router.post("/change-password", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete account endpoint
router.delete("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log('[DELETE /me] Endpoint hit');
  try {
    const userId = req.user?.userId;
    console.log('[DELETE /me] userId:', userId);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Delete user's profile picture if exists
    const user = await User.findByPk(userId);
    console.log('[DELETE /me] User found:', user ? user.toJSON() : null);
    if (user?.profilePicture) {
      const filename = user.profilePicture.split('/').pop();
      console.log('[DELETE /me] profilePicture filename:', filename);
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads', filename);
        console.log('[DELETE /me] Attempting to delete file:', filePath);
        try {
          await fs.unlink(filePath);
          console.log('[DELETE /me] File deleted successfully');
        } catch (err) {
          console.error('[DELETE /me] Error deleting profile picture:', err);
        }
      }
    }

    // Delete user from database
    const destroyResult = await User.destroy({ where: { userId } });
    console.log('[DELETE /me] User.destroy result:', destroyResult);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[DELETE /me] Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error instanceof Error ? error.message : error });
  }
});

export default router;