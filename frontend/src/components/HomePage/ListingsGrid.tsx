import React from "react";
import { useNavigate } from "react-router-dom";
import { PostListingFormData } from "../PostListing/types";
import { FaHeart } from 'react-icons/fa';
import { BsEye } from 'react-icons/bs';
import './ListingsGrid.css';
import '../Recommendations/Recommendations.css';

type ListingsGridProps = {
  listings: PostListingFormData[];
  isLoggedIn?: boolean;
  showDeleteButton?: boolean;
  renderExtra?: (listing: PostListingFormData, index: number) => React.ReactNode;
  renderLikeButton?: (listing: PostListingFormData, index: number, liked: boolean, toggleLike: () => void, likesCount: number) => React.ReactNode;
};

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings: initialListings, isLoggedIn = false, showDeleteButton = false, renderExtra, renderLikeButton }) => {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = React.useState<number[]>([]);
  const [listings, setListings] = React.useState<PostListingFormData[]>([]);
  const [failedImages, setFailedImages] = React.useState<Set<number>>(new Set());
  const userId = Number(localStorage.getItem('userId'));

  React.useEffect(() => {
    setListings([...initialListings]);
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

  const handleDelete = async (listingId: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setListings(current => current.filter(l => l.listingId !== listingId));
      } else {
        alert('Failed to delete listing');
      }
    } catch (err) {
      alert('Error deleting listing');
    }
  };

  // Handle image load errors
  const handleImageError = (listingId: number) => {
    setFailedImages(prev => new Set(prev).add(listingId));
  };

  if (listings.length === 0) {
    return <p className="text-muted text-center mt-5">No listings found.</p>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 25,
        marginTop: 50,
        padding: '0 20px',
      }}
    >
        {listings.map((listing, index) => {
          // Try to get the first photo from the Photo table (listing.Photos)
          // Fallback to listing.photos or default image
          let imageUrl = "https://placehold.co/300x200?text=No+Image&font=roboto";
          // Check if this listing's image has failed to load
          if (!failedImages.has(listing.listingId!)) {
            if ((listing as any).Photos && Array.isArray((listing as any).Photos) && (listing as any).Photos.length > 0) {
              imageUrl = (listing as any).Photos[0].url;
              if (imageUrl && !imageUrl.startsWith("http")) {
                imageUrl = `http://localhost:5000${imageUrl}`;
              }
            } else if (listing.photos && listing.photos.length > 0) {
              imageUrl = listing.photos[0];
            }
          }
          const isOwnListing = (listing as any).user?.userId === userId || (listing as any).userId === userId;
          const liked = likedIds.includes(listing.listingId!);
          const likesCount = (listing as any).likesCount ?? 0;
          return (
          <div
            key={index}
            style={{
              width: 350,
              height: 420,
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/listing/${listing.listingId}`)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {/* Delete button for own listing */}
            {showDeleteButton && isOwnListing && (
              <button
                className="btn btn-danger"
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 3, padding: '4px 12px', fontSize: 14 }}
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(listing.listingId!);
                }}
              >
                Delete
              </button>
            )}
            {/* Heart icon - hidden for owner, only if renderLikeButton is not provided */}
            {!isOwnListing && !renderLikeButton && (
              <span
                style={{
                  position: 'absolute',
                  top: showDeleteButton && isOwnListing ? 56 : 16,
                  right: 16,
                  zIndex: 2,
                  cursor: 'pointer',
                  fontSize: 24,
                  color: liked ? 'red' : '#e74c3c',
                  filter: liked ? '' : 'drop-shadow(0 0 2px #fff)',
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
                  toggleLike(listing.listingId!, liked);
                }}
                title={liked ? 'Remove from favourites' : 'Add to favourites'}
              >
                <span style={{ fontSize: 16, color: '#333', minWidth: 5, textAlign: 'center', fontWeight: 500, marginRight: 6 }}>{likesCount}</span>
                {liked ? (
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
            <div style={{ width: '100%', height: 200, flexShrink: 0, overflow: 'hidden' }}>
              <img
                src={imageUrl || "https://placehold.co/300x200?text=No+Image&font=roboto"}
                alt={listing.title || "Listing"}
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                onError={() => handleImageError(listing.listingId!)}
              />
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#2c3e50', margin: '0 0 8px 0', lineHeight: 1.3 }}>{listing.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#7f8c8d', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
                {(listing as any).Address?.City?.cityName || (listing as any).city || 'Location not specified'}
              </p>
              <p style={{ color: '#5a6c7d', fontSize: '0.9rem', margin: '0 0 12px 0', textTransform: 'capitalize' }}>
                {listing.listingType} • {listing.propertyType} • {(listing.size ?? (listing as any).sizeM2 ?? 0)}m²
              </p>
              <p style={{ color: '#27ae60', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                €{listing.rent}/month
              </p>
              {/* Render extra content if provided */}
              {renderExtra && renderExtra(listing, index)}
              {/* Render like button in main content if provided */}
              {!isOwnListing && renderLikeButton && renderLikeButton(listing, index, liked, () => toggleLike(listing.listingId!, liked), likesCount)}
            </div>
          </div>
          );
        })}
    </div>
  );
};

export default ListingsGrid;
