import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import MapPreview from '../PostListing/MapPreview';
import { BsEye } from 'react-icons/bs';
import { FaUserCircle, FaHeart } from 'react-icons/fa';
import LikesList from '../LikesList/LikesList';

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
    profilePicture?: string;
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
  const [isLiked, setIsLiked] = useState(false);
  const [showLikesList, setShowLikesList] = useState(false);
  const [likedUsers, setLikedUsers] = useState<Array<{ userId: number; userFirstName: string; userLastName: string; profilePicture?: string }>>([]);
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));
  const [showPhone, setShowPhone] = useState(false);
  const hasFetched = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchListing = async () => {
      setLoading(true);
      try {
        console.log(`[ListingPage] Fetching listing with id: ${id}`);
        const res = await fetch(`http://localhost:5000/api/listings/${id}`);
        const text = await res.text();
        console.log('[ListingPage] Raw response:', text);
        console.log('[ListingPage] HTTP status:', res.status);
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
        setListing(data);
      } catch (err) {
        console.error('[ListingPage] Error fetching listing:', err);
        setError('Error fetching listing');
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!userId || !id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/likes/${userId}`);
        const likes = await res.json();
        setIsLiked(likes.some((like: any) => like.listingId === Number(id)));
      } catch (err) {
        console.error('[ListingPage] Error checking like status:', err);
      }
    };
    checkIfLiked();
  }, [userId, id]);

  const toggleLike = async () => {
    if (!userId || !id) {
      // Show login modal for unauthenticated users
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    try {
      if (isLiked) {
        await fetch('http://localhost:5000/api/likes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, listingId: Number(id) })
        });
        setIsLiked(false);
        // Update likes count
        setListing(prev => prev ? {
          ...prev,
          likesCount: ((prev as any).likesCount ?? 1) - 1
        } : null);
      } else {
        await fetch('http://localhost:5000/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, listingId: Number(id) })
        });
        setIsLiked(true);
        // Update likes count
        setListing(prev => prev ? {
          ...prev,
          likesCount: ((prev as any).likesCount ?? 0) + 1
        } : null);
      }
    } catch (err) {
      console.error('[ListingPage] Error toggling like:', err);
    }
  };

  const handleSendMessage = () => {
    if (!userId) {
      // Show login modal for unauthenticated users
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    // Navigate to inbox with the receiver's information
    if (listing?.user) {
      navigate('/inbox', {
        state: {
          receiverId: listing.user.userId,
          receiverName: listing.user.name,
          listingId: listing.listingId
        }
      });
    }
  };

  const fetchLikedUsers = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/likes/listing/${id}/users`);
      const users = await res.json();
      setLikedUsers(users);
    } catch (err) {
      console.error('[ListingPage] Error fetching liked users:', err);
    }
  };

  const handleLikesClick = () => {
    if (listing?.listingType === "entire_property") {
      fetchLikedUsers();
      setShowLikesList(true);
    }
  };

  // Add delete handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    const token = localStorage.getItem('token');
    if (!token || !listing) return;
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${listing.listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/mylistings');
      } else {
        alert('Failed to delete listing');
      }
    } catch (err) {
      alert('Error deleting listing');
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!listing) return <div className="container mt-5">Listing not found.</div>;

  // Main and other pictures
  let allPics: string[] = [];
  if (listing.Photos && listing.Photos.length > 0) {
    allPics = listing.Photos.map(p => p.url.startsWith("http") ? p.url : `http://localhost:5000${p.url}`);
  } else if (listing.photos && listing.photos.length > 0) {
    allPics = listing.photos;
  } else {
    allPics = ["https://placehold.co/300x200?text=No+Image&font=roboto"];
  }
  const mainPic = allPics[currentPhotoIdx] || "https://placehold.co/300x200?text=No+Image&font=roboto";

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

  const totalRoommates =
    (listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) +
    (listing.flatmatesMale ?? listing.maleFlatmates ?? 0);

  const isOwnListing = listing.user && listing.user.userId === userId;

  // In the render, show delete button if user is owner
  const isOwner = userId && (listing.user?.userId === userId);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "80px" }}>
      <div className="container-fluid" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="row">
            {/* Left column - Photos */}
            <div className="col-md-8">
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
                    src={mainPic || "https://placehold.co/300x200?text=No+Image&font=roboto"}
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
                        src={pic || "https://placehold.co/300x200?text=No+Image&font=roboto"}
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
            <div className="col-md-4">
              {/* Price and Add to favourites */}
              <div className="d-flex flex-row align-items-center justify-content-between mb-3" style={{ gap: '1rem', position: 'relative' }}>
                <div>
                  <h4 className="fw-bold mb-0">{listing.rent ? `${listing.rent} EUR/month` : "Price of rent/month"}</h4>
                  <div className="d-flex align-items-center mt-2" style={{ gap: 16 }}>
                    <div className="d-flex align-items-center" style={{ gap: 6 }}>
                      <BsEye style={{ fontSize: 16, color: '#888' }} />
                      <span style={{ fontSize: 14, color: '#666' }}>{(listing as any).views ?? 0} views</span>
                    </div>
                    <div 
                      className="d-flex align-items-center" 
                      style={{ 
                        gap: 6,
                        cursor: listing.listingType === "entire_property" ? 'pointer' : 'default'
                      }}
                      onClick={handleLikesClick}
                    >
                      <FaHeart style={{ fontSize: 16, color: '#e74c3c' }} />
                      <span style={{ fontSize: 14, color: '#666' }}>{(listing as any).likesCount ?? 0} likes</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 16, alignSelf: 'center' }}>
                  {/* Add to favourites button */}
                  {!isOwnListing && (
                    <button
                      className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center`}
                      style={{ fontWeight: 500 }}
                      onClick={toggleLike}
                    >
                      <FaHeart style={{ marginRight: 8 }} />
                      {isLiked ? 'Remove from favourites' : 'Add to favourites'}
                    </button>
                  )}
                  {/* Delete button for owner */}
                  {isOwner && (
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      style={{ marginLeft: 8 }}
                    >
                      Delete Listing
                    </button>
                  )}
                </div>
              </div>
              {/* User details card */}
              <div className="card p-4 d-flex align-items-center" style={{ borderRadius: "2rem", minWidth: 0, marginTop: "32px" }}>
                <div className="d-flex align-items-center mb-3 w-100" style={{ gap: 16 }}>
                  {listing.user?.profilePicture ? (
                    <img
                      src={listing.user.profilePicture.startsWith('http') ? listing.user.profilePicture : `http://localhost:5000${listing.user.profilePicture}`}
                      alt="Profile"
                      style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', background: '#eee', border: '2px solid #ddd', cursor: 'pointer' }}
                      onClick={() => navigate(`/account/${listing.user?.userId}`, { state: { activeSubmenu: 'profile' } })}
                      onError={(e) => {
                        // Replace the img element with the default icon
                        const target = e.target as HTMLElement;
                        const parent = target.parentNode;
                        if (parent) {
                          const icon = document.createElement('div');
                          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" fill="#bbb" style="background: #eee; border-radius: 50%; cursor: pointer;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
                          icon.style.display = 'flex';
                          icon.style.alignItems = 'center';
                          icon.style.justifyContent = 'center';
                          icon.onclick = () => navigate(`/account/${listing.user?.userId}`, { state: { activeSubmenu: 'profile' } });
                          parent.replaceChild(icon, target);
                        }
                      }}
                    />
                  ) : (
                    <FaUserCircle 
                      size={56} 
                      color="#bbb" 
                      style={{ background: '#eee', borderRadius: '50%', cursor: 'pointer' }} 
                      onClick={() => navigate(`/account/${listing.user?.userId}`, { state: { activeSubmenu: 'profile' } })}
                    />
                  )}
                  <span style={{ fontWeight: 600, fontSize: 20 }}>{listing.user?.name || '[user name]'}</span>
                </div>
                <button
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    background: '#e91e63', color: '#fff', border: 'none', borderRadius: 18, padding: '12px 24px', fontSize: 18, width: '100%', fontWeight: 500, cursor: 'pointer', position: 'relative', minHeight: 56
                  }}
                  onClick={() => setShowPhone(true)}
                  disabled={showPhone || !listing.user?.phone}
                >
                  <span style={{ display: 'flex', alignItems: 'center', marginRight: 12, fontSize: 24 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>
                  </span>
                  {showPhone && listing.user?.phone
                    ? listing.user.phone
                    : `${(listing.user?.phone || '0000.....').slice(0, 4)} .....`}
                  {!showPhone && listing.user?.phone && (
                    <span style={{ fontSize: 13, display: 'block', marginLeft: 12, color: '#fff', opacity: 0.8 }}>
                      Click to reveal phone number
                    </span>
                  )}
                </button>
                {!isOwnListing && (
                  <button
                    className="btn btn-primary mt-2 w-100"
                    style={{ borderRadius: 18, fontSize: 20, fontWeight: 500, background: '#00aaff', border: 'none', padding: '12px 0' }}
                    onClick={handleSendMessage}
                  >
                    Send message
                  </button>
                )}
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
        )}
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
      {/* Add LikesList modal */}
      <LikesList
        show={showLikesList}
        onHide={() => setShowLikesList(false)}
        users={likedUsers}
        listingId={listing?.listingId}
      />
    </div>
  );
};

export default ListingPage; 