import express from 'express';
import { createAccount, login, getUserInfo, updateUserInfo, changePassword, deleteUserAccount } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', createAccount);
router.post('/login', login);
router.get('/me', authenticateToken, getUserInfo);
router.put('/me', authenticateToken, updateUserInfo);
router.post('/me/change-password', authenticateToken, changePassword);
router.delete('/me', authenticateToken, deleteUserAccount);

export default router; 