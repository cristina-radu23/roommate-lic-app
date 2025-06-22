import React, { useState, useEffect, useCallback } from "react";
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

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Combine filters and mapBounds for the query
      const queryParams = { ...filters };
      if (mapBounds) {
        Object.assign(queryParams, mapBounds);
      }
      const query = objectToQueryString(queryParams);
      const url = `http://localhost:5000/api/listings${query}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data: PostListingFormData[] = await res.json();
      setListings(data);
    } catch (err: any) {
      setError(err.message);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, mapBounds]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const applyFilters = (newFilters: FilterCriteria, coordinates?: CityCoordinates) => {
    setFilters(newFilters);
    if (coordinates) {
      setMapCenter(coordinates);
    }
    setMapBounds(null); // Reset map bounds when applying new filters
  };
  
  const handleMapChange = (bounds: L.LatLngBounds) => {
    const newBoundsFilter = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
    setMapBounds(newBoundsFilter);
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
