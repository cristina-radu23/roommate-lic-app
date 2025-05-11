import express, { Response } from "express";
import { createAccount, loginUser, getCurrentUser } from "../controllers/userController";
import authenticateToken, { AuthenticatedRequest } from "../middleware/authMiddleware";
import upload from '../middleware/upload';
import User from '../models/User';

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginUser);
router.get("/me", authenticateToken, (req, res) => { getCurrentUser(req as AuthenticatedRequest, res); });

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
    const { userFirstName, userLastName, phoneNumber, bio } = req.body;
    const [updated] = await User.update(
      { userFirstName, userLastName, phoneNumber, bio },
      { where: { userId } }
    );
    if (updated) {
      const updatedUser = await User.findByPk(userId, {
        attributes: ["userFirstName", "userLastName", "email", "phoneNumber", "profilePicture", "bio"]
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

export default router;
