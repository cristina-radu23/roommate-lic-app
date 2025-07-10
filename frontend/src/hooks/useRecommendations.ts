import { useState, useEffect, useCallback } from 'react';

interface RecommendationScore {
  listingId: number;
  score: number;
  reasons: string[];
}

interface RecommendationResponse {
  success: boolean;
  recommendations: RecommendationScore[];
  count: number;
}

export const useRecommendations = (limit: number = 20) => {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    let token = localStorage.getItem('token');
    console.log('[useRecommendations] fetchRecommendations called. token:', token);
    if (!token) {
      // Wait a bit in case login just happened
      await new Promise(res => setTimeout(res, 200));
      token = localStorage.getItem('token');
      console.log('[useRecommendations] Retried after delay. token:', token);
    }
    if (!token) {
      setError('Authentication required');
      setRecommendations([]);
      console.log('[useRecommendations] No token after delay. Returning.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/recommendations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[useRecommendations] API response status:', response.status);
      
      // Handle different HTTP status codes appropriately
      if (response.status === 401 || response.status === 403) {
        // Authentication error - don't trigger logout, just show auth required message
        setError('Authentication required');
        setRecommendations([]);
        console.log('[useRecommendations] Authentication error. Showing auth required message.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RecommendationResponse = await response.json();
      console.log('[useRecommendations] API response data:', data);
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError('Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('[useRecommendations] Error fetching recommendations:', err);
      // Don't set authentication errors for network or other errors
      if (err instanceof Error && err.message.includes('401')) {
        setError('Authentication required');
      } else if (err instanceof Error && err.message.includes('403')) {
        setError('Authentication required');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const updatePreferences = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/recommendations/update-preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle authentication errors in updatePreferences as well
      if (response.status === 401 || response.status === 403) {
        console.log('[useRecommendations] Authentication error in updatePreferences');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    updatePreferences
  };
}; 