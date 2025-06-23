import express from 'express';
import { getRecommendations, updateUserPreferences, clearRecommendationCache } from '../controllers/recommendationController';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

// Get personalized recommendations for the authenticated user
router.get('/', authenticateToken, getRecommendations);

// Update user preferences (call when user likes/unlikes a listing)
router.post('/update-preferences', authenticateToken, updateUserPreferences);

// Clear recommendation cache (admin function)
router.post('/clear-cache', authenticateToken, clearRecommendationCache);

export default router; 