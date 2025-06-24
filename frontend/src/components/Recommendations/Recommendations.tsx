import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations } from '../../hooks/useRecommendations';
import './Recommendations.css';

interface Listing {
  listingId: number;
  title: string;
  description: string;
  rent: number;
  listingType: string;
  propertyType: string;
  sizeM2: number;
  photos?: string[];
  Address?: {
    City?: {
      cityName: string;
    };
  };
}

interface RecommendationScore {
  listingId: number;
  score: number;
  reasons: string[];
}

const Recommendations: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const { recommendations, loading, error, refetch } = useRecommendations(10);
  const [listings, setListings] = useState<Map<number, Listing>>(new Map());
  const [clearingCache, setClearingCache] = useState(true);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Recommendations] Rendered. isLoggedIn:', isLoggedIn);
  });

  useEffect(() => {
    console.log('[Recommendations] isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  // Fetch listing details for recommended listings
  useEffect(() => {
    const fetchListings = async () => {
      const newListings = new Map<number, Listing>();
      
      for (const rec of recommendations) {
        try {
          const response = await fetch(`http://localhost:5000/api/listings/${rec.listingId}`);
          if (response.ok) {
            const listing: Listing = await response.json();
            newListings.set(rec.listingId, listing);
          }
        } catch (error) {
          console.error(`Error fetching listing ${rec.listingId}:`, error);
        }
      }
      
      setListings(newListings);
    };

    if (recommendations.length > 0) {
      fetchListings();
    }
  }, [recommendations]);

  // Seamlessly update recommendations on login/logout
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false);
      console.log('[Recommendations] user-logout event. Calling refetch()');
      refetch();
    };
    const handleLogin = () => {
      setIsLoggedIn(true);
      console.log('[Recommendations] user-login event. Will call refetch() after 200ms');
      setTimeout(() => {
        console.log('[Recommendations] Calling refetch() after login');
        refetch();
      }, 200);
    };
    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('user-login', handleLogin);
    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('user-login', handleLogin);
    };
  }, [refetch]);

  useEffect(() => {
    console.log('[Recommendations] recommendations:', recommendations);
    console.log('[Recommendations] error:', error);
  }, [recommendations, error]);

  // Automatically clear cache on mount
  useEffect(() => {
    let isMounted = true;
    const clearCache = async () => {
      setClearingCache(true);
      setCacheMessage(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/recommendations/clear-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok && isMounted) {
          setCacheMessage(null);
        } else if (isMounted) {
          setCacheMessage('Failed to clear cache. Recommendations may be outdated.');
        }
      } catch (err) {
        if (isMounted) setCacheMessage('Error clearing cache. Recommendations may be outdated.');
      } finally {
        if (isMounted) setClearingCache(false);
      }
    };
    clearCache();
    return () => { isMounted = false; };
  }, []);

  // Show login/register prompt if not logged in
  if (!isLoggedIn || error === 'Authentication required') {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
        </div>
        <div className="no-recommendations" style={{textAlign: 'center', marginTop: 32}}>
          <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: 16 }}>
            <b>Log in</b> or <b>Create Account</b> to find listings recommended for you!
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
        <div className="loading-spinner">Preparing recommendations...</div>
        {cacheMessage && <div style={{ marginTop: 8, color: '#888' }}>{cacheMessage}</div>}
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
            <button onClick={refetch} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
          <div className="no-recommendations">
            <p>We need at least 3 likes to provide personalized recommendations!</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Like more listings to help us understand your preferences better.
            </p>
            <Link to="/" className="browse-button">
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Recommended for You</h2>
        <p className="recommendations-subtitle">
          Based on your preferences and similar users
        </p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map((rec) => {
          const listing = listings.get(rec.listingId);
          if (!listing) return null;

          return (
            <div key={rec.listingId} className="recommendation-card">
              <div className="recommendation-score">
                <span className="score-badge">
                  {Math.min(100, Math.round(rec.score))}% match
                </span>
              </div>
              
              <Link to={`/listing/${rec.listingId}`} className="listing-link">
                <div className="listing-image">
                  {listing.photos && listing.photos.length > 0 ? (
                    <img 
                      src={listing.photos[0]} 
                      alt={listing.title}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="listing-info">
                  <h3 className="listing-title">{listing.title}</h3>
                  <p className="listing-location">
                    {listing.Address?.City?.cityName || 'Location not specified'}
                  </p>
                  <p className="listing-details">
                    {listing.listingType} • {listing.propertyType} • {listing.sizeM2}m²
                  </p>
                  <p className="listing-price">€{listing.rent}/month</p>
                </div>
              </Link>
              
              <div className="recommendation-reasons">
                <h4>Why this matches you:</h4>
                <ul>
                  {rec.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="recommendations-footer">
        <button onClick={refetch} className="refresh-button">
          Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

export default Recommendations; 