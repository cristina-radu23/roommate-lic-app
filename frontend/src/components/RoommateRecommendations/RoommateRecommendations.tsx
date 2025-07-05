import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RoommateAnnouncement, PreferencesStatus } from '../../types/roommate';
import { idealRoommatePreferenceApi } from '../../services/roommateApi';
import AnnouncementCard from '../RoommateAnnouncements/AnnouncementCard';
import './RoommateRecommendations.css';

const RoommateRecommendations: React.FC<{
  roommateFilters: any;
  setRoommateFilters: (filters: any) => void;
  preferredCities: any[];
  setPreferredCities: (cities: any[]) => void;
}> = ({ roommateFilters, setRoommateFilters, preferredCities, setPreferredCities }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RoommateAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferencesStatus, setPreferencesStatus] = useState<PreferencesStatus | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false);
      setRecommendations([]);
      setPreferencesStatus(null);
      setError(null);
      setLoading(false);
    };

    const handleLogin = () => {
      setIsLoggedIn(true);
      setLoading(true);
    };

    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('user-login', handleLogin);

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('user-login', handleLogin);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      checkPreferencesAndLoadRecommendations(roommateFilters, preferredCities);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, JSON.stringify(roommateFilters), JSON.stringify(preferredCities)]);

  const checkPreferencesAndLoadRecommendations = async (filters: any = {}, cities: any[] = []) => {
    try {
      setLoading(true);
      setError(null);

      // First check if user has completed the ideal roommate form
      const statusResponse = await idealRoommatePreferenceApi.checkPreferencesStatus();
      setPreferencesStatus(statusResponse.data);

      if (!statusResponse.data.hasPreferences || !statusResponse.data.isComplete) {
        // User hasn't completed the form
        setLoading(false);
        return;
      }

      // Build filters object
      const filterObj = { ...filters, locationAreas: cities.map((c: any) => c.label) };
      const recommendationsResponse = await idealRoommatePreferenceApi.getRecommendedAnnouncements(1, 20, filterObj);
      setRecommendations(recommendationsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteForm = () => {
    navigate('/ideal-roommate-form');
  };

  // Show login/register prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
        </div>
        <div className="no-recommendations" style={{textAlign: 'center', marginTop: 32}}>
          <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: 16 }}>
            <b>Log in</b> or <b>Create Account</b> to find roommate recommendations for you!
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a
              href="#"
              className="browse-button"
              style={{ minWidth: 120, background: '#ff4081', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(255,64,129,0.08)', fontWeight: 600 }}
              onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-login-modal')); }}
            >
              Log in
            </a>
            <Link to="/createaccount" className="browse-button" style={{ minWidth: 120, background: '#ff4081', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(255,64,129,0.08)', fontWeight: 600 }}>Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
        </div>
        <div className="loading-spinner">Preparing roommate recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
          <div className="error-message">
            {error}
            <button onClick={() => checkPreferencesAndLoadRecommendations(roommateFilters, preferredCities)} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User hasn't completed the ideal roommate form
  if (!preferencesStatus?.hasPreferences || !preferencesStatus?.isComplete) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
        </div>
        <div className="no-recommendations">
          <p>Complete your <b>Ideal Roommate Profile</b> to get personalized recommendations!</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            Tell us about your preferences to help us find your perfect roommate match.
          </p>
          <button onClick={handleCompleteForm} className="browse-button">
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  // No recommendations available
  if (recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
        </div>
        <div className="no-recommendations">
          <p>We couldn't find any roommate announcements that match your preferences right now.</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            Check back later or try adjusting your preferences.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => checkPreferencesAndLoadRecommendations(roommateFilters, preferredCities)} className="browse-button">
              Refresh Recommendations
            </button>
            <button onClick={handleCompleteForm} className="browse-button" style={{ background: '#9b59b6' }}>
              Update Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container" style={{ background: 'none', padding: 0, margin: 0, boxShadow: 'none' }}>
      <div className="recommendations-header">
        <h2>Recommended for You</h2>
        <p className="recommendations-subtitle">
          Based on your ideal roommate preferences
        </p>
      </div>
      <div className="recommendations-grid">
        {recommendations.map((announcement) => (
          <div key={announcement.announcementId} className="recommendation-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
              <span className="score-badge">
                {Math.min(100, Math.round(announcement.compatibilityScore || 0))}% match
              </span>
            </div>
            <AnnouncementCard announcement={announcement} />
            <div className="recommendation-reasons">
              <h4>Why this matches you:</h4>
              <ul>
                <li>Similar budget range</li>
                <li>Compatible lifestyle preferences</li>
                <li>Matching location preferences</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="recommendations-footer">
        <button onClick={() => checkPreferencesAndLoadRecommendations(roommateFilters, preferredCities)} className="refresh-button">
          Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

export default RoommateRecommendations; 