import express from 'express';
import { createAccount, loginUser, getCurrentUser, deleteUserAccount, verifyEmail, resendVerificationEmail } from '../controllers/userController';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', createAccount);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);
router.delete('/me', authenticateToken, deleteUserAccount);

export default router; 