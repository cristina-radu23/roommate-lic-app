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
  const { recommendations, loading, error, refetch } = useRecommendations(10);
  const [listings, setListings] = useState<Map<number, Listing>>(new Map());

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

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Recommended for You</h2>
          <div className="loading-spinner">Loading recommendations...</div>
        </div>
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
                  {Math.round(rec.score)}% match
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