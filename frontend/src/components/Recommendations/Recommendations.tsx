import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations } from '../../hooks/useRecommendations';
import './Recommendations.css';
import ListingsGrid from '../HomePage/ListingsGrid';
import MapComponent, { CityCoordinates } from '../Map/MapComponent';
import L from 'leaflet';

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

interface RecommendationsProps {
  filters?: any;
  tab: 'browseAll' | 'recommended';
  onTabChange: (tab: 'browseAll' | 'recommended') => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ filters = {}, tab, onTabChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const { recommendations, loading, error, refetch } = useRecommendations(10);
  const [listings, setListings] = useState<Map<number, Listing>>(new Map());
  const [clearingCache, setClearingCache] = useState(true);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<CityCoordinates | undefined>(undefined);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [useMapBounds, setUseMapBounds] = useState(false);

  // LOG: props and tab
  console.log('[Recommendations] props:', { filters, tab });

  useEffect(() => {
    console.log('[Recommendations] Rendered. isLoggedIn:', isLoggedIn);
  });

  useEffect(() => {
    console.log('[Recommendations] isLoggedIn changed:', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('[Recommendations] recommendations:', recommendations);
    console.log('[Recommendations] error:', error);
  }, [recommendations, error]);

  useEffect(() => {
    if (tab === 'recommended') {
      console.log('[Recommendations] Fetching recommendations with filters:', filters);
    } else {
      console.log('[Recommendations] Not fetching recommendations, tab is:', tab);
    }
  }, [tab, filters]);

  // Fetch listing details for recommended listings
  useEffect(() => {
    const fetchListings = async () => {
      const results = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const response = await fetch(`http://localhost:5000/api/listings/${rec.listingId}`);
            if (response.ok) {
              const listing: Listing = await response.json();
              return [rec.listingId, listing];
            }
          } catch (error) {
            console.error(`Error fetching listing ${rec.listingId}:`, error);
          }
          return null;
        })
      );
      const newListings = new Map<number, Listing>();
      results.forEach((item) => {
        if (item) {
          const [listingId, listing] = item as [number, Listing];
          newListings.set(listingId, listing);
        }
      });
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

  // Handle map bounds change
  const handleMapChange = (bounds: L.LatLngBounds) => {
    const newBoundsFilter = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
    setMapBounds(newBoundsFilter);
    setUseMapBounds(true);
  };

  // Combine filters and map bounds for filtering
  const effectiveFilters = { ...filters };
  if (mapBounds && useMapBounds) {
    Object.assign(effectiveFilters, mapBounds);
  }

  // Filtering logic matching backend
  function filterListings(listings: any[], filters: any) {
    return listings.filter(listing => {
      // minRent / maxRent
      if (filters.minRent !== undefined && listing.rent < filters.minRent) return false;
      if (filters.maxRent !== undefined && listing.rent > filters.maxRent) return false;
      // listingType
      if (filters.listingType && listing.listingType !== filters.listingType) return false;
      // propertyType
      if (filters.propertyType && listing.propertyType !== filters.propertyType) return false;
      // preferredRoommate
      if (filters.preferredRoommate === 'female' && (listing.flatmatesMale ?? 0) > 0) return false;
      if (filters.preferredRoommate === 'male' && (listing.flatmatesFemale ?? 0) > 0) return false;
      // city
      if (filters.city && String(listing.Address?.City?.cityId ?? listing.cityId ?? listing.city) !== String(filters.city)) return false;
      // amenities (property amenities)
      if (filters.amenities && filters.amenities.length > 0) {
        const propertyAmenities = (listing.PropertyAmenities || listing.propertyAmenities || []).map((a: any) => a.name);
        if (!filters.amenities.every((a: string) => propertyAmenities.includes(a))) return false;
      }
      // rules (house rules)
      if (filters.rules && filters.rules.length > 0) {
        const houseRules = (listing.HouseRules || listing.houseRules || []).map((r: any) => r.name);
        if (!filters.rules.every((r: string) => houseRules.includes(r))) return false;
      }
      // roomAmenities
      if (filters.roomAmenities && filters.roomAmenities.length > 0) {
        const roomAmenities = (listing.RoomAmenities || listing.roomAmenities || []).map((a: any) => a.name);
        if (!filters.roomAmenities.every((a: string) => roomAmenities.includes(a))) return false;
      }
      // Geographic bounds
      if (
        filters.north !== undefined && filters.south !== undefined &&
        filters.east !== undefined && filters.west !== undefined
      ) {
        const lat = listing.latitude ?? (listing.Address?.latitude);
        const lng = listing.longitude ?? (listing.Address?.longitude);
        if (
          lat === undefined || lng === undefined ||
          lat < filters.south || lat > filters.north ||
          lng < filters.west || lng > filters.east
        ) return false;
      }
      return true;
    });
  }

  // Map recommendations to listings with match info
  const listingsWithMatch = recommendations
    .map(rec => {
      const listing = listings.get(rec.listingId);
      if (!listing) return null;
      return { ...listing, matchScore: rec.score, matchReasons: rec.reasons };
    })
    .filter(Boolean);

  // Apply filters
  const filteredListings = filterListings(listingsWithMatch, effectiveFilters);

  // Sort by matchScore descending
  const sortedListings = [...filteredListings].sort((a, b) => Number(b.matchScore ?? 0) - Number(a.matchScore ?? 0));

  // Debug log for sorting
  console.log("Sorted listings by matchScore:", sortedListings.map(l => l.matchScore));

  // Only pass listings with lat/lng to the map
  const mapListings = sortedListings.filter(l => typeof l.latitude === 'number' && typeof l.longitude === 'number');

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
            <Link to="/?tab=browseAll" className="browse-button">
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Layout: map and grid side by side
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: 'calc(100vh - 360px)', margin: 0, padding: 0 }}>
      {/* Left: Recommendations Grid (2/3) */}
      
      <div style={{ flex: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
        <div className="recommendations-header" style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 16px 0', gap: 8, width: '100%' }}>
            <button
              className={tab === 'browseAll' ? 'active-tab' : ''}
              style={{
                padding: '8px 24px',
                borderRadius: 24,
                border: 'none',
                background: tab === 'browseAll' ? '#ff4081' : '#f0f0f0',
                color: tab === 'browseAll' ? '#fff' : '#333',
                fontWeight: tab === 'browseAll' ? 700 : 500,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: tab === 'browseAll' ? '0 2px 8px rgba(255,64,129,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
              onClick={() => onTabChange('browseAll')}
            >
              Browse All
            </button>
            <button
              className={tab === 'recommended' ? 'active-tab' : ''}
              style={{
                padding: '8px 24px',
                borderRadius: 24,
                border: 'none',
                background: tab === 'recommended' ? '#ff4081' : '#f0f0f0',
                color: tab === 'recommended' ? '#fff' : '#333',
                fontWeight: tab === 'recommended' ? 700 : 500,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: tab === 'recommended' ? '0 2px 8px rgba(255,64,129,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
              onClick={() => onTabChange('recommended')}
            >
              Recommended for You
            </button>
          </div>
          <h2>Recommended for You</h2>
          <p className="recommendations-subtitle">
            Based on your preferences and similar users
          </p>
        </div>
        <div style={{ width: '100%' }}>
         
          {tab === 'recommended' && (
            <ListingsGrid
              listings={sortedListings as any}
              isLoggedIn={!!localStorage.getItem('token')}
              renderExtra={(listing: any) => (
                <>
                  <div className="recommendation-score" style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                    <span className="score-badge">
                      {Math.min(100, Math.round(listing.matchScore))}% match
                    </span>
                  </div>
                  <div className="recommendation-reasons" style={{ marginTop: 12 }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>Why this matches you:</h4>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {listing.matchReasons && listing.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                        <li key={idx} style={{ fontSize: '0.95rem', color: '#2c3e50' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            />
          )}
          {tab === 'browseAll' && (
            <div>
              {/* Optionally, show a message or a different grid for Browse All */}
            </div>
          )}
        </div>
      </div>
      {/* Right: Map (1/3, sticky/fixed) */}
      <div style={{ flex: 1, position: 'sticky', top: 0, height: 'calc(100vh - 360px)', minHeight: 400, maxHeight: '100vh', alignSelf: 'flex-start', zIndex: 1 }}>
        <MapComponent
          listings={mapListings as any}
          onBoundsChange={handleMapChange}
          center={mapCenter}
        />
      </div>
    </div>
  );
};

export default Recommendations; 