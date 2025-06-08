import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostListingFormData } from '../PostListing/types';
import ListingsGrid from '../HomePage/ListingsGrid';

const Favourites: React.FC = () => {
  const [listings, setListings] = useState<PostListingFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        // First get all likes for the user
        const likesRes = await fetch(`http://localhost:5000/api/likes/${userId}`);
        const likes = await likesRes.json();
        
        // Then fetch details for each liked listing
        const listingPromises = likes.map((like: any) => 
          fetch(`http://localhost:5000/api/listings/${like.listingId}`).then(res => res.json())
        );
        
        const listingsData = await Promise.all(listingPromises);
        setListings(listingsData);
      } catch (err) {
        console.error('Error fetching favourites:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [userId, navigate]);

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
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "80px" }}>
      <div className="container-fluid" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 className="mb-4">Favourites</h2>
        {listings.length === 0 ? (
          <div className="alert alert-info" role="alert">
            You haven't added any listings to your favourites yet.
          </div>
        ) : (
          <ListingsGrid listings={listings} isLoggedIn={!!localStorage.getItem('token')} showDeleteButton={false} />
        )}
      </div>
    </div>
  );
};

export default Favourites; 