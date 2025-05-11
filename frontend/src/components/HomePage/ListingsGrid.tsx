import React from "react";
import { useNavigate } from "react-router-dom";
import { PostListingFormData } from "../PostListing/types";
import { FaHeart } from 'react-icons/fa';

type ListingsGridProps = {
  listings: PostListingFormData[];
};

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings }) => {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = React.useState<number[]>([]);
  const userId = Number(localStorage.getItem('userId'));

  React.useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/likes/${userId}`)
      .then(res => res.json())
      .then((likes) => setLikedIds(likes.map((like: any) => like.listingId)));
  }, [userId]);

  const toggleLike = async (listingId: number, liked: boolean) => {
    if (!userId) return;
    if (liked) {
      await fetch('http://localhost:5000/api/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, listingId })
      });
      setLikedIds(ids => ids.filter(id => id !== listingId));
    } else {
      await fetch('http://localhost:5000/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, listingId })
      });
      setLikedIds(ids => [...ids, listingId]);
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
          let imageUrl = "/default-image.jpg";
          // If backend returns Photos as an array
          if ((listing as any).Photos && Array.isArray((listing as any).Photos) && (listing as any).Photos.length > 0) {
            imageUrl = (listing as any).Photos[0].url;
            // If the url does not start with http, add backend host
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }
          } else if (listing.photos && listing.photos.length > 0) {
            imageUrl = listing.photos[0];
          }
          return (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/listing/${listing.listingId}`)}>
                <img
                  src={imageUrl}
                  className="card-img-top"
                  alt={listing.title || "Listing"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                {/* Heart icon at bottom right over image */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 2,
                    cursor: 'pointer',
                    fontSize: 24,
                    color: likedIds.includes(listing.listingId!) ? 'red' : '#e74c3c',
                    filter: likedIds.includes(listing.listingId!) ? '' : 'drop-shadow(0 0 2px #fff)'
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    toggleLike(listing.listingId!, likedIds.includes(listing.listingId!));
                  }}
                  title={likedIds.includes(listing.listingId!) ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <FaHeart style={{ marginRight: '10px', marginBottom: '10px' }} fill={likedIds.includes(listing.listingId!) ? 'red' : 'none'} stroke="#e74c3c" strokeWidth={9} />
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
