import React, { useState, useEffect, useCallback, useRef } from "react";
import L from 'leaflet';
import SearchBar from "./SearchBar";
import ListingsGrid from "./ListingsGrid";
import MapComponent, { CityCoordinates } from "../Map/MapComponent";
import { PostListingFormData } from "../PostListing/types";

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
  const [listings, setListings] = useState<PostListingFormData[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [mapCenter, setMapCenter] = useState<CityCoordinates | undefined>(undefined);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMapBounds, setUseMapBounds] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const query = objectToQueryString(queryParams);
      const url = `http://localhost:5000/api/listings${query}`;
      console.log("[HomePage] Fetching listings from:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data: PostListingFormData[] = await res.json();
      console.log("[HomePage] Received listings:", data.length);
      setListings(data);
    } catch (err: any) {
      setError(err.message);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, mapBounds, useMapBounds]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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
    
    console.log("[HomePage] Map bounds changed:", newBoundsFilter);
    
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

  const mapListings = listings.filter(l => typeof (l as any).latitude === 'number' && typeof (l as any).longitude === 'number');

  return (
    <div style={{ 
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh + 100px)",
      marginTop: "56px",
    }}>
      <SearchBar onSearch={applyFilters} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left side: Listings */}
        <div style={{ flex: "2 1 0", overflowY: "auto", padding: "1rem" }}>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">Error: {error}</p>
          ) : listings.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <p className="text-muted text-center">No listings found.</p>
            </div>
          ) : (
            <ListingsGrid listings={listings} isLoggedIn={!!localStorage.getItem('token')} />
          )}
        </div>

        {/* Right side: Map */}
        <div style={{ flex: "1 1 0", height: "100%", position: 'relative' }}>
          <MapComponent 
            listings={mapListings as any} 
            onBoundsChange={handleMapChange}
            center={mapCenter}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
