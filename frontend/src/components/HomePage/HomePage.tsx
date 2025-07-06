import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import SearchBar from "./SearchBar";
import ListingsGrid from "./ListingsGrid";
import MapComponent, { CityCoordinates } from "../Map/MapComponent";
import { PostListingFormData } from "../PostListing/types";
import SidebarMenu, { MenuSection } from "./SidebarMenu";
import Recommendations from "../../components/Recommendations/Recommendations";
import RoommateAnnouncementsBrowser from '../RoommateAnnouncements/RoommateAnnouncementsBrowser';
import RoommateFilterPanel from '../RoommateAnnouncements/RoommateFilterPanel';
import RoommateRecommendations from '../RoommateRecommendations/RoommateRecommendations';
import { useAuth } from '../../hooks/useAuth';

export interface FilterCriteria {
  city?: string;
  minRent?: number;
  maxRent?: number;
  rules?: string[];
  amenities?: string[];
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

function objectToQueryString(obj: Record<string, any>) {
  const params = Object.entries(obj)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) =>
      Array.isArray(v)
        ? v.map((item) => `${encodeURIComponent(k)}=${encodeURIComponent(item)}`).join("&")
        : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join("&");
  return params ? `?${params}` : "";
}

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [listings, setListings] = useState<PostListingFormData[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [mapCenter, setMapCenter] = useState<CityCoordinates | undefined>(undefined);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMapBounds, setUseMapBounds] = useState(false);
  const [mode, setMode] = useState<'properties' | 'roommates'>("properties");
  const [tab, setTab] = useState<'browseAll' | 'recommended'>('browseAll');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [roommateFilters, setRoommateFilters] = useState({});
  const [preferredCities, setPreferredCities] = useState<any[]>([]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Combine filters and mapBounds for the query
      const queryParams = { ...filters };
      if (mapBounds && useMapBounds) {
        Object.assign(queryParams, mapBounds);
        console.log("[HomePage] Using map bounds for filtering:", mapBounds);
      }
      let url = "";
      if (tab === "browseAll") {
        const query = objectToQueryString(queryParams);
        url = `http://localhost:5000/api/listings${query}`;
      } else if (tab === "recommended") {
        // For recommendations, pass filters as query params if needed
        const query = objectToQueryString(queryParams);
        url = `http://localhost:5000/api/recommendations${query}`;
      }
      console.log("[HomePage] Fetching listings from:", url);
      const res = await fetch(url, {
        headers: tab === "recommended" && isLoggedIn ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to fetch listings');
      let data: any = await res.json();
      // If recommendations, extract listings from the response
      if (tab === "recommended") {
        if (Array.isArray(data.recommendations)) {
          // Optionally, you may want to fetch full listing details for each recommended listing
          // For now, assume recommendations already contain listing details
          data = data.recommendations;
        } else {
          data = [];
        }
      }
      setListings(data);
      console.log("[HomePage] Received listings:", data.length);
    } catch (err: any) {
      setError(err.message);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, mapBounds, useMapBounds, tab]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle URL parameters to automatically switch tabs
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'browseAll') {
      setTab('browseAll');
      setMode('properties');
    } else if (tabParam === 'recommended') {
      setTab('recommended');
      setMode('properties');
    }
  }, [location.search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const applyFilters = (newFilters: FilterCriteria, coordinates?: CityCoordinates) => {
    console.log("[HomePage] Applying filters:", newFilters, "with coordinates:", coordinates);
    setFilters(newFilters);
    if (coordinates) {
      setMapCenter(coordinates);
      console.log("[HomePage] Setting map center to:", coordinates);
    } else {
      setMapCenter(undefined);
    }
    setMapBounds(null); // Reset map bounds when applying new filters
    setUseMapBounds(false); // Don't use map bounds for initial filter
  };
  
  const handleMapChange = (bounds: L.LatLngBounds) => {
    const newBoundsFilter = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
    console.log('[HomePage] handleMapChange newBoundsFilter:', newBoundsFilter);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      console.log("[HomePage] Applying debounced map bounds");
      setMapBounds(newBoundsFilter);
      setUseMapBounds(true); // Enable map bounds filtering after user stops moving
    }, 500); // 500ms delay
  };

  // Add logs for map bounds and center
  useEffect(() => {
    console.log('[HomePage] mapCenter changed:', mapCenter);
  }, [mapCenter]);
  useEffect(() => {
    console.log('[HomePage] mapBounds changed:', mapBounds);
  }, [mapBounds]);

  // Log filtered listings for map (for debugging)
  const filteredMapListings = listings.filter(l => typeof (l as any).latitude === 'number' && typeof (l as any).longitude === 'number');
  if (mode === 'properties' && tab === 'browseAll') {
    console.log('[HomePage] MapComponent listings:', filteredMapListings);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      marginTop: "56px",
      background: "#fafbfc"
    }}>
      {/* SearchBar with radio group overlayed in its background */}
      <div style={{ position: 'relative', width: '100vw', maxWidth: '100vw', margin: 0, padding: 0 }}>
        <SearchBar
          onSearch={applyFilters}
          isRoommateMode={mode === 'roommates'}
          roommateFilters={roommateFilters}
          setRoommateFilters={setRoommateFilters}
          preferredCities={preferredCities}
          setPreferredCities={setPreferredCities}
        />
        {/* Radio group overlayed below search bar, centered, white text, smaller font */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '60%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}>
          <label style={{ color: 'white', fontWeight: 600, fontSize: 16, marginBottom: 6, textShadow: '0 2px 8px #0008' }}>What are you looking for today?</label>
          <div style={{ display: 'flex', gap: 24, marginTop: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: mode === 'properties' ? 700 : 400, cursor: 'pointer', color: 'white', textShadow: '0 2px 8px #0008' }}>
              <input
                type="radio"
                name="mode"
                checked={mode === 'properties'}
                onChange={() => { setMode('properties'); setTab('browseAll'); }}
                style={{ marginRight: 6 }}
              />
              Properties
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: mode === 'roommates' ? 700 : 400, cursor: 'pointer', color: 'white', textShadow: '0 2px 8px #0008' }}>
              <input
                type="radio"
                name="mode"
                checked={mode === 'roommates'}
                onChange={() => { setMode('roommates'); setTab('browseAll'); }}
                style={{ marginRight: 6 }}
              />
              Roommates
            </label>
          </div>
        </div>
      </div>

      {/* Main content area */}
      {mode === 'properties' && tab === 'recommended' ? (
        <Recommendations filters={filters} tab={tab} onTabChange={setTab} />
      ) : mode === 'properties' && tab === 'browseAll' ? (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: 'calc(100vh - 300px)', margin: 0, padding: 0 }}>
          {/* Left: Tabs + Listings (2/3) */}
          <div style={{ flex: 2, overflowY: 'auto', height: '100%', paddingTop: '20px', paddingBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Tabs for browse/recommended, only in left 2/3 */}
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
                onClick={() => {
                  setTab('browseAll');
                  // Use React Router navigation to update URL
                  window.location.href = '/?tab=browseAll';
                }}
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
                onClick={() => {
                  setTab('recommended');
                  // Use React Router navigation to update URL
                  window.location.href = '/?tab=recommended';
                }}
              >
                Recommended for You
              </button>
            </div>
            {/* Listings */}
            {isLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-danger">Error: {error}</p>
            ) : listings.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <p className="text-muted text-center">No listings found.</p>
              </div>
            ) : (
              <ListingsGrid listings={listings} isLoggedIn={isLoggedIn} />
            )}
          </div>
          {/* Right: Map (1/3, sticky/fixed) */}
          <div style={{ flex: 1, minWidth: 350, height: 'calc(100vh - 360px)', minHeight: 400, maxHeight: '100vh', position: 'sticky', top: 0, alignSelf: 'flex-start', zIndex: 1 }}>
            <MapComponent
              listings={filteredMapListings as any}
              onBoundsChange={handleMapChange}
              center={mapCenter}
            />
          </div>
        </div>
      ) : mode === 'roommates' ? (
        <>
          {/* Tabs for roommates states */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop:'20px', margin: '0 0 16px 0', gap: 8, width: '100%' }}>
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
              onClick={() => setTab('browseAll')}
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
              onClick={() => setTab('recommended')}
            >
              Recommended for You
            </button>
          </div>
          {tab === 'browseAll' ? (
            <RoommateAnnouncementsBrowser filters={roommateFilters} />
          ) : tab === 'recommended' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <RoommateRecommendations 
                roommateFilters={roommateFilters}
                setRoommateFilters={setRoommateFilters}
                preferredCities={preferredCities}
                setPreferredCities={setPreferredCities}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default HomePage;
