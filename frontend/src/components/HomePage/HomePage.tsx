import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "./SearchBar";
import ListingsGrid from "./ListingsGrid";
import { PostListingFormData } from "../PostListing/types";

export interface FilterCriteria {
  city?: string;
  minRent?: number;
  maxRent?: number;
  rules?: string[];
  amenities?: string[];
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
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [listings, setListings] = useState<PostListingFormData[]>([]);

  const fetchListings = useCallback(async () => {
    try {
      const query = objectToQueryString(filters);
      const url = `http://localhost:5000/api/listings${query}`;
      console.log("[Frontend] Fetching listings with:", url);
      const res = await fetch(url);
      const data: PostListingFormData[] = await res.json();
      setListings(data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const applyFilters = (criteria: FilterCriteria) => {
    setFilters(criteria);
  };

  return (
    <div className="container-fluid p-0" style={{ width: "100%" }}>
      <div style={{ width: "100%", background: "#f0d4f3", padding: 0, margin: 0, marginTop: "56px", paddingTop: 0 }}>
        <SearchBar onSearch={applyFilters} />
      </div>
      {listings.length === 0 ? (
        <div style={{ minHeight: "500px", width: "100%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="text-muted text-center mt-5">No listings found.</p>
        </div>
      ) : (
        <ListingsGrid listings={listings} isLoggedIn={!!localStorage.getItem('token')} />
      )}
    </div>
  );
};

export default HomePage;
