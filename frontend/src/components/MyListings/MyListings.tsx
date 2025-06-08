import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostListingFormData } from '../PostListing/types';
import ListingsGrid from '../HomePage/ListingsGrid';

const MyListings: React.FC = () => {
  const [listings, setListings] = useState<PostListingFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:5000/api/listings/user/listings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        console.log('Fetched listings:', data); // Debug log
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err); // Debug log
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" >
      <h2 className="mb-4" style={{ marginTop: "95px" }}>My Listings</h2>
      {listings.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You haven't created any listings yet. <a href="/postListing" className="alert-link">Create your first listing</a>
        </div>
      ) : (
        <ListingsGrid listings={listings} isLoggedIn={!!localStorage.getItem('token')} showDeleteButton={true} />
      )}
    </div>
  );
};

export default MyListings; 