import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapPreview from '../PostListing/MapPreview';

interface ListingData {
  listingId: number;
  title: string;
  cityName: string;
  rent: number;
  Photos?: { url: string }[];
  photos?: string[];
  user?: {
    name: string;
    phone: string;
    userId: number;
  };
  userRole?: string;
  description?: string;
  availableFrom?: string;
  availableTo?: string;
  noDeposit?: boolean;
  deposit?: number;
  listingType?: "room" | "entire_property";
  propertyType?: "apartment" | "house";
  sizeM2?: number;
  size?: number;
  roomSizeM2?: number;
  roomSize?: number;
  flatmatesFemale?: number;
  flatmatesMale?: number;
  femaleFlatmates?: number;
  maleFlatmates?: number;
  PropertyAmenities?: { name: string }[];
  amenities?: string[];
  RoomAmenities?: { name: string }[];
  roomAmenities?: string[];
  hasBed?: boolean;
  bedType?: string;
  // Add other fields as needed
}

const ListingPage: React.FC = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        console.log(`[ListingPage] Fetching listing with id: ${id}`);
        const res = await fetch(`http://localhost:5000/api/listings/${id}`);
        const data = await res.json();
        console.log('[ListingPage] Received data:', data);
        setListing(data);
      } catch (err) {
        console.error('[ListingPage] Error fetching listing:', err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!listing) return <div className="container mt-5">Listing not found.</div>;

  // Main and other pictures
  let allPics: string[] = [];
  if (listing.Photos && listing.Photos.length > 0) {
    allPics = listing.Photos.map(p => p.url.startsWith("http") ? p.url : `http://localhost:5000${p.url}`);
  } else if (listing.photos && listing.photos.length > 0) {
    allPics = listing.photos;
  } else {
    allPics = ["/default-image.jpg"];
  }
  const mainPic = allPics[currentPhotoIdx] || "/default-image.jpg";
  const otherPics = allPics.filter((_, i) => i !== currentPhotoIdx);

  // Carousel navigation
  const goToPrev = () => setCurrentPhotoIdx((prev) => (prev - 1 + allPics.length) % allPics.length);
  const goToNext = () => setCurrentPhotoIdx((prev) => (prev + 1) % allPics.length);

  // Modal navigation
  const openModal = (idx: number) => {
    setModalPhotoIdx(idx);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const modalPrev = () => setModalPhotoIdx((prev) => (prev - 1 + allPics.length) % allPics.length);
  const modalNext = () => setModalPhotoIdx((prev) => (prev + 1) % allPics.length);

  // Previews: main photo first, then others
  const previews = [mainPic, ...allPics.filter((_, i) => i !== currentPhotoIdx)];

  // Extract address and coordinates
  const streetName = (listing as any).Address?.streetName || "";
  const streetNo = (listing as any).Address?.streetNo || "";
  const city = (listing as any).Address?.City?.cityName || "";
  const fullAddress = `${streetName} ${streetNo} ${city}`.trim();
  const lat = (listing as any).Address?.lat || 44.4268; // fallback: Bucharest
  const lng = (listing as any).Address?.lng || 26.1025;

  const totalRoommates =
    (listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) +
    (listing.flatmatesMale ?? listing.maleFlatmates ?? 0);

  return (
    <div className="container-fluid" style={{ minHeight: "100vh", background: "#fff", marginTop: "56px",
     paddingTop: "7px", paddingLeft: "30px", paddingRight: "30px" }}>
      <div className="row justify-content-center mt-4">
        {/* Main content */}
        <div className="col-lg-8">
          <h2 className="fw-bold">{listing.title}</h2>
          <div className="text-muted mb-2">{listing.cityName}</div>
           <div className="card p-4 mb-4" style={{ borderRadius: "2rem", backgroundColor: "#f8f9fa",border: "0px" }}>
            {/* Main picture with carousel controls */}
            <div style={{ position: "relative", borderRadius: "2rem", overflow: "hidden", border: "2px solid #ccc", height: 450, display: "flex", alignItems: "center", justifyContent: "center", background: "#eee" }}>
              {/* Left arrow */}
              {allPics.length > 1 && (
                <button
                  onClick={goToPrev}
                  style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    width: 10,
                    height: 55,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.8)",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer"
                  }}
                  aria-label="Previous photo"
                >
                  &#60;
                </button>
              )}
              {/* Main photo */}
              <img
                src={mainPic}
                alt="main"
                style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer" }}
                onClick={() => openModal(currentPhotoIdx)}
              />
              {/* Right arrow */}
              {allPics.length > 1 && (
                <button
                  onClick={goToNext}
                  style={{
                    position: "absolute",
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    width: 10,
                    height: 55,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.8)",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer"
                  }}
                  aria-label="Next photo"
                >
                  &#62;
                </button>
              )}
            </div>
            {/* Previews: main + others */}
            <div className="d-flex gap-3 mt-3">
              {previews.map((pic, i) => {
                // Find the real index in allPics
                const realIdx = allPics.findIndex((p) => p === pic);
                const isMain = i === 0;
                return (
                  <img
                    key={i}
                    src={pic}
                    alt={`preview-${i}`}
                    style={{
                      borderRadius: "1rem",
                      border: isMain ? "3px solid #007bff" : "2px solid #ccc",
                      width: 120,
                      height: 80,
                      objectFit: "cover",
                      background: "#f5f5f5",
                      cursor: isMain ? "default" : "pointer",
                      opacity: isMain ? 1 : 0.8
                    }}
                    onClick={() => {
                      if (!isMain) setCurrentPhotoIdx(realIdx);
                    }}
                  />
                );
              })}
            </div>
          </div>
          {/* Description and all data */}
          <div className="card p-4 mb-4" style={{ borderRadius: "2rem" }}>
            <h5 className="fw-bold mb-3">Description</h5>
            <div style={{ marginBottom: 16 }}>
              {listing.description || <span className="text-muted">No description provided.</span>}
              <p style={{ marginTop: 12 }}>
              {listing.userRole === "tenant" && (
                  <span>{listing.user?.name} is a tenant in the property.</span>
                )}
                {listing.userRole === "owner" && (
                  <span>{listing.user?.name} is the owner of the property.</span>
                )}
              </p>
            </div>
            <h6 className="fw-bold mb-2">Details</h6>
            {/* User/role phrase above the subtitle */}
            
            <div style={{ marginBottom: 16, marginTop: 16 }}>
              {/*aici*/}
              <div style={{
  display: "grid",
  gridTemplateColumns: "max-content 1fr",
  gap: "8px 24px",
  alignItems: "center",
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 20,
  marginBottom: 24
}}>
  {/* Move-in date */}
  <div>You can move in starting from</div>
  <div>{listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : "-"}</div>

  {/* Last day of stay */}
  {listing.availableTo && (
    <>
      <div>The last day of stay is</div>
      <div>{new Date(listing.availableTo).toLocaleDateString()}</div>
    </>
  )}

  {/* Deposit */}
  {listing.noDeposit !== true && listing.deposit && (
    <>
      <div>The deposit required</div>
      <div>{listing.deposit} EUR</div>
    </>
  )}

  {/* Type of property offered */}
  <div>Type of property offered</div>
  <div>
    {listing.listingType === "room"
      ? `A room in an ${listing.propertyType === "apartment" ? "apartment" : "house"}.`
      : `The entire ${listing.propertyType === "apartment" ? "apartment" : "house"}.`
    }
  </div>

  {/* Property size */}
  <div>Property size</div>
  <div>{listing.sizeM2 || listing.size || "-"} m²</div>

  {/* Room size */}
  {listing.listingType === "room" && (listing.roomSizeM2 || listing.roomSize) && (
    <>
      <div>Room size</div>
      <div>{listing.roomSizeM2 || listing.roomSize} m²</div>
    </>
  )}

  {/* Roommates */}
  {((listing.flatmatesFemale ?? 0) > 0 || (listing.flatmatesMale ?? 0) > 0 || (listing.femaleFlatmates ?? 0) > 0 || (listing.maleFlatmates ?? 0) > 0) && (
    <>
      <div>Roommates</div>
      <div>
        On the property already {totalRoommates === 1 ? "lives" : "live"} 
        {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) > 0) && (
          <> {(listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0)} {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) === 1 ? "woman" : "women")}</>
        )}
        {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) > 0 && (listing.flatmatesMale ?? listing.maleFlatmates ?? 0) > 0) && " and"}
        {((listing.flatmatesMale ?? listing.maleFlatmates ?? 0) > 0) && (
          <> {(listing.flatmatesMale ?? listing.maleFlatmates ?? 0)} {((listing.flatmatesMale ?? listing.maleFlatmates ?? 0) === 1 ? "man" : "men")}</>
        )}
      </div>
    </>
  )}

  {/* Property amenities */}
  {listing.PropertyAmenities && listing.PropertyAmenities.length > 0 && (
    <>
      <div>Property amenities</div>
      <div>{listing.PropertyAmenities.map((a: any) => a.name).join(", ")}</div>
    </>
  )}
  {listing.amenities && listing.amenities.length > 0 && (
    <>
      <div>Property amenities</div>
      <div>{listing.amenities.join(", ")}</div>
    </>
  )}

  {/* Room amenities */}
  {listing.listingType === "room" && listing.RoomAmenities && listing.RoomAmenities.length > 0 && (
    <>
      <div>Room amenities</div>
      <div>{listing.RoomAmenities.map((a: any) => a.name).join(", ")}</div>
    </>
  )}
  {listing.listingType === "room" && listing.roomAmenities && listing.roomAmenities.length > 0 && (
    <>
      <div>Room amenities</div>
      <div>{listing.roomAmenities.join(", ")}</div>
    </>
  )}

  {/* Bed type */}
  {listing.listingType === "room" && listing.hasBed && listing.bedType && (
    <>
      <div>The room has a</div>
      <div>{listing.bedType.replace('_', ' ')} bed</div>
    </>
  )}
</div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Price and Add to favourites */}
          <div className="d-flex flex-row align-items-center justify-content-between mb-3" style={{ gap: '1rem' }}>
            <h4 className="fw-bold mb-0">{listing.rent ? `${listing.rent} EUR/month` : "Price of rent/month"}</h4>
            <button className="btn btn-outline-danger d-flex align-items-center" style={{ borderRadius: "1rem" }}>
              Add to favourites <span className="ms-2" style={{ fontSize: 22 }}>&#9825;</span>
            </button>
          </div>
          {/* User details card */}
          <div className="card p-4" style={{ borderRadius: "2rem", minWidth: 0, marginTop: "32px" }}>
            <div className="fw-bold mb-2">User details</div>
            <div>Name: {listing.user?.name || "[user name]"}</div>
            <div>Phone: {listing.user?.phone || "[revealable phone number]"}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>*Profile picture to be implemented in the future*</div>
            <button
              className="btn btn-primary mt-3"
              onClick={() => {
                console.log('[ListingPage] listing.user:', listing.user);
                if (listing.user && listing.user.userId) {
                  navigate('/inbox', {
                    state: {
                      receiverId: listing.user.userId,
                      receiverName: listing.user.name,
                      listingId: listing.listingId
                    }
                  });
                }
              }}
            >
              Send Message
            </button>
          </div>
          {/* Map card */}
          <div className="card p-4 mt-4" style={{ borderRadius: "2rem", minWidth: 0 }}>
            <div className="fw-bold mb-2">Address</div>
            <div style={{ marginBottom: 12 }}>
              Str {streetName} No. {streetNo}
            </div>
            <MapPreview address={fullAddress} />
          </div>
        </div>
      </div>
      {/* Modal for photo viewing */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={closeModal}
        >
          <div
            style={{ position: "relative", background: "#fff", borderRadius: 16, padding: 16, maxWidth: 1500, width: "90vw", maxHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left arrow */}
            {allPics.length > 1 && (
              <button
                onClick={modalPrev}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  width: 10,
                  height: 55,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.8)",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer"
                }}
                aria-label="Previous photo"
              >
                &#60;
              </button>
            )}
            <img
              src={allPics[modalPhotoIdx]}
              alt={`modal-${modalPhotoIdx}`}
              style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12, objectFit: "contain" }}
            />
            {/* Right arrow */}
            {allPics.length > 1 && (
              <button
                onClick={modalNext}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  width: 10,
                  height: 55,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.8)",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer"
                }}
                aria-label="Next photo"
              >
                &#62;
              </button>
            )}
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 3,
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 10,
                height: 47,
                fontSize: 20,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingPage; 