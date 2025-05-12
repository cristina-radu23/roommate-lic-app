import React from "react";
import { useNavigate } from "react-router-dom";
import { PostListingFormData } from "../PostListing/types";
import { FaHeart } from 'react-icons/fa';
import { BsEye } from 'react-icons/bs';

type ListingsGridProps = {
  listings: PostListingFormData[];
  isLoggedIn?: boolean;
};

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings: initialListings, isLoggedIn = false }) => {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = React.useState<number[]>([]);
  const [listings, setListings] = React.useState<PostListingFormData[]>([]);
  const userId = Number(localStorage.getItem('userId'));

  React.useEffect(() => {
    // Sort listings by creation date in descending order (newest first)
    const sortedListings = [...initialListings].sort((a, b) => {
      const dateA = new Date((a as any).createdAt || 0);
      const dateB = new Date((b as any).createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    setListings(sortedListings);
  }, [initialListings]);

  React.useEffect(() => {
    if (!userId || !isLoggedIn) {
      setLikedIds([]);
      return;
    }
    fetch(`http://localhost:5000/api/likes/${userId}`)
      .then(res => res.json())
      .then((likes) => setLikedIds(likes.map((like: any) => like.listingId)));
  }, [userId, isLoggedIn]);

  // Listen for logout event
  React.useEffect(() => {
    const handleLogout = () => {
      setLikedIds([]);
      // Force a re-render of the listings to show like buttons for all posts
      setListings(prevListings => [...prevListings]);
    };

    window.addEventListener('user-logout', handleLogout);
    return () => window.removeEventListener('user-logout', handleLogout);
  }, []);

  const toggleLike = async (listingId: number, liked: boolean) => {
    if (!userId || !isLoggedIn) {
      // Show login modal for unauthenticated users
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    try {
      if (liked) {
        await fetch('http://localhost:5000/api/likes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, listingId })
        });
        setLikedIds(ids => ids.filter(id => id !== listingId));
        // Update likes count
        setListings(currentListings => currentListings.map(listing => 
          listing.listingId === listingId 
            ? { ...listing, likesCount: ((listing as any).likesCount ?? 1) - 1 }
            : listing
        ));
      } else {
        await fetch('http://localhost:5000/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, listingId })
        });
        setLikedIds(ids => [...ids, listingId]);
        // Update likes count
        setListings(currentListings => currentListings.map(listing => 
          listing.listingId === listingId 
            ? { ...listing, likesCount: ((listing as any).likesCount ?? 0) + 1 }
            : listing
        ));
      }
    } catch (err) {
      console.error('[ListingsGrid] Error toggling like:', err);
    }
  };

  if (listings.length === 0) {
    return <p className="text-muted text-center mt-5">No listings found.</p>;
  }

  return (
    <div className="container mt-5 container-fluid" style={{ width:"2000px", marginBottom:"70px"}}>
      <div className="row g-4">
        {listings.map((listing, index) => {
          // Try to get the first photo from the Photo table (listing.Photos)
          // Fallback to listing.photos or default image
          let imageUrl = "https://placehold.co/300x200?text=No+Image&font=roboto";
          if ((listing as any).Photos && Array.isArray((listing as any).Photos) && (listing as any).Photos.length > 0) {
            imageUrl = (listing as any).Photos[0].url;
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }
          } else if (listing.photos && listing.photos.length > 0) {
            imageUrl = listing.photos[0];
          }
          const isOwnListing = (listing as any).user?.userId === userId || (listing as any).userId === userId;
          return (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/listing/${listing.listingId}`)}>
                <img
                  src={imageUrl || "https://placehold.co/300x200?text=No+Image&font=roboto"}
                  className="card-img-top"
                  alt={listing.title || "Listing"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                {/* Heart icon - hidden for owner */}
                {!isOwnListing && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 2,
                      cursor: 'pointer',
                      fontSize: 24,
                      color: likedIds.includes(listing.listingId!) ? 'red' : '#e74c3c',
                      filter: likedIds.includes(listing.listingId!) ? '' : 'drop-shadow(0 0 2px #fff)',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: 20,
                      padding: '2px 12px',
                      gap: 10,
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      toggleLike(listing.listingId!, likedIds.includes(listing.listingId!));
                    }}
                    title={likedIds.includes(listing.listingId!) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <span style={{ fontSize: 16, color: '#333', minWidth: 5, textAlign: 'center', fontWeight: 500, marginRight: 6 }}>{(listing as any).likesCount ?? 0}</span>
                    {likedIds.includes(listing.listingId!) ? (
                      <FaHeart fill="red" stroke="#e74c3c" strokeWidth={2} />
                    ) : (
                      <FaHeart fill="none" stroke="#e74c3c" strokeWidth={7} />
                    )}
                  </span>
                )}
                {/* Views count - always visible */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 20,
                    padding: '2px 12px',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 16, color: '#333', minWidth: 5, textAlign: 'center', fontWeight: 500, marginRight: 4 }}>{(listing as any).views ?? 0}</span>
                  <BsEye style={{ fontSize: 18, color: '#888' }} />
                </span>
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title">{listing.title}</h5>
                    <p className="card-text text-muted">
                      {(listing.cityName || (listing as any).Address?.City?.cityName || (listing as any).Address?.cityName || "-")}, {listing.streetName || (listing as any).Address?.streetName || "-"} {listing.streetNo || (listing as any).Address?.streetNo || ""}
                    </p>
                  </div>
                  <div>
                    <p className="fw-bold">
                      {listing.rent ? `${listing.rent} EUR/month` : "-"}
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {listing.propertyType && (
                        <span className="badge bg-primary">{listing.propertyType}</span>
                      )}
                      {listing.listingType && (
                        <span className="badge bg-secondary">{listing.listingType}</span>
                      )}
                      {listing.roomAmenities?.slice(0, 2).map((a, idx) => (
                        <span key={idx} className="badge bg-light text-dark border">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListingsGrid;
