import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Initialize recommendation service
const recommendationService = new RecommendationService();

export const getRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const recommendations = await recommendationService.getRecommendations(userId, limit);

    res.json({
      success: true,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

export const updateUserPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await recommendationService.updateUserPreferences(userId);
    
    res.json({
      success: true,
      message: 'User preferences updated'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
};

export const clearRecommendationCache = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    recommendationService.clearCache();
    
    res.json({
      success: true,
      message: 'Recommendation cache cleared'
    });
  } catch (error) {
    console.error('Error clearing recommendation cache:', error);
    res.status(500).json({ error: 'Failed to clear recommendation cache' });
  }
}; 