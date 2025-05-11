import React from "react";
import { useNavigate } from "react-router-dom";
import { PostListingFormData } from "../PostListing/types";

type ListingsGridProps = {
  listings: PostListingFormData[];
};

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings }) => {
  const navigate = useNavigate();
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
              <div className="card h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/listing/${listing.listingId}`)}>
                <img
                  src={imageUrl}
                  className="card-img-top"
                  alt={listing.title || "Listing"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title">{listing.title}</h5>
                    <p className="card-text text-muted">
                      {listing.cityName || "-"}, {listing.streetName || "-"} {listing.streetNo || ""}
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
