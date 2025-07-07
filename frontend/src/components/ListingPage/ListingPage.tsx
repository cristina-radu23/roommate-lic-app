import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import MapPreview from '../PostListing/MapPreview';
import { BsEye } from 'react-icons/bs';
import { FaUserCircle, FaHeart, FaEdit, FaSave, FaTimes, FaEllipsisV, FaTrash } from 'react-icons/fa';
import LikesList from '../LikesList/LikesList';
import ApplyToListingModal from '../ApplyToListingModal/ApplyToListingModal';

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

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  
  // Editable details state
  const [editAvailableFrom, setEditAvailableFrom] = useState("");
  const [editAvailableTo, setEditAvailableTo] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [editNoDeposit, setEditNoDeposit] = useState(false);
  const [editListingType, setEditListingType] = useState<"room" | "entire_property">("room");
  const [editPropertyType, setEditPropertyType] = useState<"apartment" | "house">("apartment");
  const [editSizeM2, setEditSizeM2] = useState("");
  const [editRoomSizeM2, setEditRoomSizeM2] = useState("");
  const [editFlatmatesFemale, setEditFlatmatesFemale] = useState("");
  const [editFlatmatesMale, setEditFlatmatesMale] = useState("");
  const [editHasBed, setEditHasBed] = useState<"yes" | "no">("no");
  const [editBedType, setEditBedType] = useState("");
  
  // Editable amenities state
  const [editPropertyAmenities, setEditPropertyAmenities] = useState<string[]>([]);
  const [editRoomAmenities, setEditRoomAmenities] = useState<string[]>([]);
  
  // Amenities lists
  const propertyAmenitiesList = [
    "TV", "WiFi", "Air Conditioning", "Parking", "Heating",
    "Washing Machine", "Elevator", "Furnished", "Garden", "Terrace",
  ];
  
  const roomAmenitiesList = ["Furnished", "Private Bathroom", "Balcony", "Air Conditioner"];
  
  // Bed types list
  const bedTypesList = [
    "single", "double", "sofa_bed"
  ];
  
  // Dropdown menu state
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [mapContainerStyle, setMapContainerStyle] = useState<React.CSSProperties>({});

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

  // Fetch liked users when component mounts
  useEffect(() => {
    if (id) {
      fetchLikedUsers();
    }
  }, [id]);

  // Calculate map container position to align with Details container bottom
  useEffect(() => {
    if (listing) {
      const timer = setTimeout(() => {
        const leftColumn = document.querySelector('.col-md-8');
        const rightColumn = document.querySelector('.col-md-4');
        const mapCard = document.querySelector('.map-card');
        
        if (leftColumn && rightColumn && mapCard) {
          const leftHeight = leftColumn.getBoundingClientRect().height;
          const rightTopHeight = rightColumn.getBoundingClientRect().top;
          const mapCardTop = mapCard.getBoundingClientRect().top;
          const mapCardHeight = mapCard.getBoundingClientRect().height;
          
          const leftBottom = rightTopHeight + leftHeight;
          const mapBottom = mapCardTop + mapCardHeight;
          
          // For room listings (no likes list), position map at same level as Details
          if (listing.listingType === "room") {
            // Find the Details container (the card that contains the Details section)
            const detailsContainer = leftColumn.querySelector('.card.p-4.mb-4');
            if (detailsContainer) {
              const detailsContainerTop = detailsContainer.getBoundingClientRect().top;
              const rightColumnTop = rightColumn.getBoundingClientRect().top;
              const leftColumnTop = leftColumn.getBoundingClientRect().top;
              
              // Calculate the offset needed to move map container to same level as Details
              const mapCardTop = mapCard.getBoundingClientRect().top;
              const offset = detailsContainerTop - mapCardTop;
              
              // Calculate the height of the Details container
              const detailsContainerHeight = detailsContainer.getBoundingClientRect().height;
              
              console.log('Room listing alignment:', {
                detailsContainerTop,
                mapCardTop,
                offset,
                detailsContainerHeight
              });
              
              setMapContainerStyle({
                position: 'relative',
                top: `${offset}px`,
                height: `${detailsContainerHeight}px`
              });
            }
          } else {
            // For entire_property listings (with likes list), extend height to align with Details
            if (mapBottom < leftBottom) {
              const additionalHeight = leftBottom - mapBottom;
              setMapContainerStyle({
                height: `${mapCardHeight + additionalHeight - 20}px` // 20px shorter
              });
            } else {
              setMapContainerStyle({
                height: `${mapCardHeight - 30}px` // 20px shorter even when no extension needed
              });
            }
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [listing]);

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

  const handleApplyToListing = () => {
    if (!userId) {
      // Show login modal for unauthenticated users
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    setShowApplyModal(true);
  };

  const handleMatch = async (targetUserId: number) => {
    if (!userId || !id) {
      // Show login modal for unauthenticated users
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    
    try {
      await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userAId: userId,
          userBId: targetUserId,
          listingId: Number(id),
          actingUserId: userId
        })
      });
      
      // Optionally refresh the likes list or show a success message
      console.log('Match request sent successfully');
    } catch (err) {
      console.error('[ListingPage] Error sending match request:', err);
    }
  };

  // Handle image load errors
  const handleImageError = (userId: number) => {
    console.log('Image failed to load for user:', userId);
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      console.log('Updated failed images set:', Array.from(newSet));
      return newSet;
    });
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

  // Add edit handler
  const handleEdit = () => {
    if (!listing) return;
    navigate(`/edit-listing/${listing.listingId}`);
  };

  // Edit mode functions
  const enterEditMode = () => {
    if (!listing) return;
    setIsEditMode(true);
    setEditDescription(listing.description || "");
    
    // Populate editable details fields
    setEditAvailableFrom(listing.availableFrom ? listing.availableFrom.split('T')[0] : "");
    setEditAvailableTo(listing.availableTo ? listing.availableTo.split('T')[0] : "");
    setEditDeposit(listing.deposit ? listing.deposit.toString() : "");
    setEditNoDeposit(listing.noDeposit || false);
    setEditListingType(listing.listingType || "room");
    setEditPropertyType(listing.propertyType || "apartment");
    setEditSizeM2(listing.sizeM2 ? listing.sizeM2.toString() : "");
    setEditRoomSizeM2(listing.roomSizeM2 ? listing.roomSizeM2.toString() : "");
    setEditFlatmatesFemale(listing.flatmatesFemale ? listing.flatmatesFemale.toString() : "");
    setEditFlatmatesMale(listing.flatmatesMale ? listing.flatmatesMale.toString() : "");
    setEditHasBed(listing.hasBed ? "yes" : "no");
    setEditBedType(listing.bedType || "");
    
    // Populate editable amenities fields
    setEditPropertyAmenities(
      listing.PropertyAmenities?.map((a: any) => a.name) || 
      listing.amenities || 
      []
    );
    setEditRoomAmenities(
      listing.RoomAmenities?.map((a: any) => a.name) || 
      listing.roomAmenities || 
      []
    );
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setEditDescription("");
    setNewPhotos([]);
    
    // Reset editable details fields
    setEditAvailableFrom("");
    setEditAvailableTo("");
    setEditDeposit("");
    setEditNoDeposit(false);
    setEditListingType("room");
    setEditPropertyType("apartment");
    setEditSizeM2("");
    setEditRoomSizeM2("");
    setEditFlatmatesFemale("");
    setEditFlatmatesMale("");
    setEditHasBed("no");
    setEditBedType("");
    
    // Reset editable amenities fields
    setEditPropertyAmenities([]);
    setEditRoomAmenities([]);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewPhotos(prev => [...prev, ...fileArray]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing photo from listing
  const removeExistingPhoto = (index: number) => {
    if (!listing) return;
    
    setListing(prev => prev ? {
      ...prev,
      Photos: prev.Photos?.filter((_, i) => i !== index) || []
    } : null);
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex || !listing) return;
    
    const photos = [...(listing.Photos || [])];
    const draggedPhoto = photos[draggedIndex];
    
    // Remove the dragged photo from its original position
    photos.splice(draggedIndex, 1);
    
    // Insert it at the new position
    photos.splice(dropIndex, 0, draggedPhoto);
    
    // Update the listing with reordered photos
    setListing(prev => prev ? {
      ...prev,
      Photos: photos
    } : null);
    
    // Reset drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (newPhotos.length === 0) return [];
    
    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const photo of newPhotos) {
        const formData = new FormData();
        formData.append('photo', photo);
        
        const response = await fetch('http://localhost:5000/api/listings/upload-photo', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploadingPhotos(false);
    }
    
    return uploadedUrls;
  };

  const saveChanges = async () => {
    if (!listing) return;
    
    setSavingChanges(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to edit listings');
        return;
      }

      // Upload new photos first
      const newPhotoUrls = await uploadPhotos();
      
      // Update listing with new description and photos
      const updateData = {
        description: editDescription,
        photos: newPhotoUrls,
        updatedPhotos: listing.Photos?.map(p => p.url.startsWith("http") ? p.url : `http://localhost:5000${p.url}`) || [],
        availableFrom: editAvailableFrom,
        availableTo: editAvailableTo,
        deposit: editDeposit ? parseInt(editDeposit) : undefined,
        noDeposit: editNoDeposit,
        listingType: editListingType,
        propertyType: editPropertyType,
        sizeM2: editSizeM2 ? parseInt(editSizeM2) : undefined,
        roomSizeM2: editRoomSizeM2 ? parseInt(editRoomSizeM2) : undefined,
        flatmatesFemale: editFlatmatesFemale ? parseInt(editFlatmatesFemale) : 0,
        flatmatesMale: editFlatmatesMale ? parseInt(editFlatmatesMale) : 0,
        propertyAmenities: editPropertyAmenities,
        roomAmenities: editRoomAmenities,
        hasBed: editHasBed === "yes",
        bedType: editBedType
      };
      
      console.log('Sending update data to backend:', updateData);
      
      const response = await fetch(`http://localhost:5000/api/listings/${listing.listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Update local state
        setListing(prev => prev ? {
          ...prev,
          description: editDescription,
          Photos: [...(prev.Photos || []), ...newPhotoUrls.map(url => ({ url }))],
          availableFrom: editAvailableFrom,
          availableTo: editAvailableTo,
          deposit: editDeposit ? parseInt(editDeposit) : undefined,
          noDeposit: editNoDeposit,
          listingType: editListingType,
          propertyType: editPropertyType,
          sizeM2: editSizeM2 ? parseInt(editSizeM2) : undefined,
          roomSizeM2: editRoomSizeM2 ? parseInt(editRoomSizeM2) : undefined,
          flatmatesFemale: editFlatmatesFemale ? parseInt(editFlatmatesFemale) : 0,
          flatmatesMale: editFlatmatesMale ? parseInt(editFlatmatesMale) : 0,
          PropertyAmenities: editPropertyAmenities.map(name => ({ name })),
          RoomAmenities: editRoomAmenities.map(name => ({ name })),
          hasBed: editHasBed === "yes",
          bedType: editBedType
        } : null);
        
        exitEditMode();
        alert('Changes saved successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  // Dropdown menu functions
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Amenities toggle functions
  const togglePropertyAmenity = (item: string) => {
    const updated = editPropertyAmenities.includes(item)
      ? editPropertyAmenities.filter((i) => i !== item)
      : [...editPropertyAmenities, item];
    setEditPropertyAmenities(updated);
  };

  const toggleRoomAmenity = (item: string) => {
    const updated = editRoomAmenities.includes(item)
      ? editRoomAmenities.filter((i) => i !== item)
      : [...editRoomAmenities, item];
    setEditRoomAmenities(updated);
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

  // Previews: keep original order, just highlight the current one
  const previews = allPics;

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
               <div className="card p-4" style={{ borderRadius: "2rem", backgroundColor: "#f8f9fa",border: "0px" }}>
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
                {/* Photo reorder hint in edit mode */}
                {isEditMode && allPics.length > 1 && (
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      💡 Drag photos to reorder. The first photo will be the main photo.
                    </small>
                  </div>
                )}
                {/* Previews: main + others */}
                <div className="d-flex gap-3 mt-3">
                  {previews.map((pic, i) => {
                    const isCurrent = i === currentPhotoIdx;
                    const isDragging = draggedIndex === i;
                    const isDragOver = dragOverIndex === i;
                    
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          position: 'relative',
                          opacity: isDragging ? 0.5 : 1,
                          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          cursor: isEditMode ? 'grab' : 'pointer'
                        }}
                        draggable={isEditMode}
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, i)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={pic || "https://placehold.co/300x200?text=No+Image&font=roboto"}
                          alt={`preview-${i}`}
                          style={{
                            borderRadius: "1rem",
                            border: isCurrent ? "3px solid #007bff" : isDragOver ? "3px solid #28a745" : "2px solid #ccc",
                            width: 120,
                            height: 80,
                            objectFit: "cover",
                            background: "#f5f5f5",
                            cursor: isCurrent ? "default" : "pointer",
                            opacity: isCurrent ? 1 : 0.8,
                            pointerEvents: isEditMode ? 'none' : 'auto'
                          }}
                          onClick={() => {
                            if (!isCurrent && !isEditMode) setCurrentPhotoIdx(i);
                          }}
                        />
                        
                        {/* Delete button for existing photos in edit mode */}
                        {isEditMode && (
                          <button
                            onClick={() => removeExistingPhoto(i)}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              fontSize: '12px',
                              cursor: 'pointer',
                              zIndex: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              lineHeight: 1
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Photo upload section in edit mode */}
              {isEditMode && (
                <div className="card p-4 mb-4" style={{ borderRadius: "2rem" }}>
                  <h5 className="fw-bold mb-3">Add More Photos</h5>
                  <div className="mb-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="form-control"
                      style={{ borderRadius: "8px" }}
                    />
                    <small className="text-muted">Select multiple photos to add to your listing.</small>
                  </div>
                  
                  {/* Preview of new photos */}
                  {newPhotos.length > 0 && (
                    <div>
                      <h6 className="fw-bold mb-2">New Photos to Upload:</h6>
                      <div className="d-flex gap-2 flex-wrap">
                        {newPhotos.map((photo, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`new-photo-${index}`}
                              style={{
                                width: 120,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #ddd'
                              }}
                            />
                            <button
                              onClick={() => removeNewPhoto(index)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadingPhotos && (
                    <div className="mt-3">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                      <span className="ms-2">Uploading photos...</span>
                    </div>
                  )}
                </div>
              )}
              

              
              {/* Description and all data */}
              <div className="card p-4 mb-4" style={{ borderRadius: "2rem", minHeight: "680px" }}>
                <h5 className="fw-bold mb-3">Description</h5>
                <div style={{ marginBottom: 16 }}>
                  {isEditMode ? (
                    <div>
                      <textarea
                        className="form-control"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={6}
                        placeholder="Enter description..."
                        style={{ 
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          padding: "12px",
                          fontSize: "14px"
                        }}
                      />
                      <small className="text-muted">Edit your listing description here.</small>
                    </div>
                  ) : (
                    <>
                      {listing.description || <span className="text-muted">No description provided.</span>}
                      <p style={{ marginTop: 12 }}>
                        {listing.userRole === "tenant" && (
                          <span>{listing.user?.name} is a tenant in the property.</span>
                        )}
                        {listing.userRole === "owner" && (
                          <span>{listing.user?.name} is the owner of the property.</span>
                        )}
                      </p>
                    </>
                  )}
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
    <div>
      {isEditMode ? (
        <input
          type="date"
          className="form-control"
          value={editAvailableFrom}
          onChange={(e) => setEditAvailableFrom(e.target.value)}
          style={{ width: '100%', maxWidth: '200px' }}
        />
      ) : (
        listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : "-"
      )}
    </div>

    {/* Last day of stay */}
    <div>The last day of stay is</div>
    <div>
      {isEditMode ? (
        <input
          type="date"
          className="form-control"
          value={editAvailableTo}
          onChange={(e) => setEditAvailableTo(e.target.value)}
          style={{ width: '100%', maxWidth: '200px' }}
        />
      ) : (
        listing.availableTo ? new Date(listing.availableTo).toLocaleDateString() : "-"
      )}
    </div>

    {/* Deposit */}
    <div>The deposit required</div>
    <div>
      {isEditMode ? (
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control"
            value={editDeposit}
            onChange={(e) => setEditDeposit(e.target.value)}
            placeholder="Amount"
            style={{ width: '100px' }}
            disabled={editNoDeposit}
          />
          <span>EUR</span>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={editNoDeposit}
              onChange={(e) => setEditNoDeposit(e.target.checked)}
              id="noDeposit"
            />
            <label className="form-check-label" htmlFor="noDeposit">
              No deposit
            </label>
          </div>
        </div>
      ) : (
        listing.noDeposit !== true && listing.deposit ? `${listing.deposit} EUR` : "No deposit"
      )}
    </div>

    {/* Type of property offered */}
    <div>Type of property offered</div>
    <div>
      {isEditMode ? (
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={editListingType}
            onChange={(e) => setEditListingType(e.target.value as "room" | "entire_property")}
            style={{ width: 'auto' }}
          >
            <option value="room">Room</option>
            <option value="entire_property">Entire Property</option>
          </select>
          <span>in a</span>
          <select
            className="form-select"
            value={editPropertyType}
            onChange={(e) => setEditPropertyType(e.target.value as "apartment" | "house")}
            style={{ width: 'auto' }}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
          </select>
        </div>
      ) : (
        listing.listingType === "room"
          ? `A room in an ${listing.propertyType === "apartment" ? "apartment" : "house"}.`
          : `The entire ${listing.propertyType === "apartment" ? "apartment" : "house"}.`
      )}
    </div>

    {/* Property size */}
    <div>Property size</div>
    <div>
      {isEditMode ? (
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control"
            value={editSizeM2}
            onChange={(e) => setEditSizeM2(e.target.value)}
            placeholder="Size"
            style={{ width: '100px' }}
          />
          <span>m²</span>
        </div>
      ) : (
        `${listing.sizeM2 || listing.size || "-"} m²`
      )}
    </div>

    {/* Room size */}
    {editListingType === "room" && (
      <>
        <div>Room size</div>
        <div>
          {isEditMode ? (
            <div className="d-flex align-items-center gap-2">
              <input
                type="number"
                className="form-control"
                value={editRoomSizeM2}
                onChange={(e) => setEditRoomSizeM2(e.target.value)}
                placeholder="Room size"
                style={{ width: '100px' }}
              />
              <span>m²</span>
            </div>
          ) : (
            `${listing.roomSizeM2 || listing.roomSize || "-"} m²`
          )}
        </div>
      </>
    )}

    {/* Roommates */}
    <div>Roommates</div>
    <div>
      {isEditMode ? (
        <div className="d-flex align-items-center gap-2">
          <span>On the property already live</span>
          <input
            type="number"
            className="form-control"
            value={editFlatmatesFemale}
            onChange={(e) => setEditFlatmatesFemale(e.target.value)}
            placeholder="0"
            style={{ width: '60px' }}
            min="0"
          />
          <span>women and</span>
          <input
            type="number"
            className="form-control"
            value={editFlatmatesMale}
            onChange={(e) => setEditFlatmatesMale(e.target.value)}
            placeholder="0"
            style={{ width: '60px' }}
            min="0"
          />
          <span>men</span>
        </div>
      ) : (
        totalRoommates === 0 ? (
          <div>No other roommates</div>
        ) : (
          <>
            On the property already {totalRoommates === 1 ? "lives" : "live"} 
            {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) > 0) && (
              <> {(listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0)} {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) === 1 ? "woman" : "women")}</>
            )}
            {((listing.flatmatesFemale ?? listing.femaleFlatmates ?? 0) > 0 && (listing.flatmatesMale ?? listing.maleFlatmates ?? 0) > 0) && " and"}
            {((listing.flatmatesMale ?? listing.maleFlatmates ?? 0) > 0) && (
              <> {(listing.flatmatesMale ?? listing.maleFlatmates ?? 0)} {((listing.flatmatesMale ?? listing.maleFlatmates ?? 0) === 1 ? "man" : "men")}</>
            )}
          </>
        )
      )}
    </div>

    {/* Property amenities */}
    <div>Property amenities</div>
    <div>
      {isEditMode ? (
        <div className="d-flex flex-wrap gap-2">
          {propertyAmenitiesList.map((item) => (
            <button
              key={item}
              type="button"
              className={`btn btn-sm ${
                editPropertyAmenities.includes(item)
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => togglePropertyAmenity(item)}
            >
              {editPropertyAmenities.includes(item) ? `-${item}` : `+${item}`}
            </button>
          ))}
        </div>
      ) : (
        listing.PropertyAmenities && listing.PropertyAmenities.length > 0 
          ? listing.PropertyAmenities.map((a: any) => a.name).join(", ")
          : listing.amenities && listing.amenities.length > 0
          ? listing.amenities.join(", ")
          : "No amenities specified"
      )}
    </div>

    {/* Room amenities */}
    {editListingType === "room" && (
      <>
        <div>Room amenities</div>
        <div>
          {isEditMode ? (
            <div className="d-flex flex-wrap gap-2">
              {roomAmenitiesList.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`btn btn-sm ${
                    editRoomAmenities.includes(item)
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => toggleRoomAmenity(item)}
                >
                  {editRoomAmenities.includes(item) ? `-${item}` : `+${item}`}
                </button>
              ))}
            </div>
          ) : (
            listing.RoomAmenities && listing.RoomAmenities.length > 0
              ? listing.RoomAmenities.map((a: any) => a.name).join(", ")
              : listing.roomAmenities && listing.roomAmenities.length > 0
              ? listing.roomAmenities.join(", ")
              : "No room amenities specified"
          )}
        </div>
      </>
    )}

    {/* Bed type */}
    {listing.listingType === "room" && (
      <>
        <div>The room has a bed</div>
        <div>
          {isEditMode ? (
            <div>
              {/* Has Bed */}
              <div className="mb-2">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="editHasBed"
                    id="editHasBedYes"
                    value="yes"
                    checked={editHasBed === "yes"}
                    onChange={(e) => setEditHasBed(e.target.value as "yes" | "no")}
                  />
                  <label className="form-check-label" htmlFor="editHasBedYes">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="editHasBed"
                    id="editHasBedNo"
                    value="no"
                    checked={editHasBed === "no"}
                    onChange={(e) => setEditHasBed(e.target.value as "yes" | "no")}
                  />
                  <label className="form-check-label" htmlFor="editHasBedNo">No</label>
                </div>
              </div>
              
              {/* Bed Type (if hasBed is yes) */}
              {editHasBed === "yes" && (
                <div className="mb-2">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="editBedType"
                      id="editBedTypeSingle"
                      value="single"
                      checked={editBedType === "single"}
                      onChange={(e) => setEditBedType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="editBedTypeSingle">Single Bed</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="editBedType"
                      id="editBedTypeDouble"
                      value="double"
                      checked={editBedType === "double"}
                      onChange={(e) => setEditBedType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="editBedTypeDouble">Double Bed</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="editBedType"
                      id="editBedTypeSofa"
                      value="sofa_bed"
                      checked={editBedType === "sofa_bed"}
                      onChange={(e) => setEditBedType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="editBedTypeSofa">Sofa Bed</label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            listing.hasBed && listing.bedType ? (
              <div>{listing.bedType.replace('_', ' ')}</div>
            ) : (
              <div>No bed</div>
            )
          )}
        </div>
      </>
    )}
  </div>
                </div>
                
                {/* Save Changes button in edit mode */}
                {isEditMode && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #eee' }}>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-lg"
                        onClick={saveChanges}
                        disabled={savingChanges || uploadingPhotos}
                        style={{
                          padding: '12px 32px',
                          fontSize: '18px',
                          fontWeight: '600',
                          borderRadius: '12px',
                          minWidth: '200px',
                          backgroundColor: '#a1cca7',
                          borderColor: '#a1cca7',
                          color: 'white'
                        }}
                      >
                        {savingChanges ? 'Saving Changes...' : 'Save Changes'}
                      </button>
                    </div>
                    {(savingChanges || uploadingPhotos) && (
                      <div className="text-center mt-3">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span className="ms-2 text-muted">
                          {uploadingPhotos ? 'Uploading photos...' : 'Saving changes...'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                    <div style={{ overflow: 'visible', minWidth: '140px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: '24px',
                          padding: '32px',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'visible'
                        }}
                        onClick={toggleLike}
                      >
                        {isLiked ? (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="red" stroke="#e74c3c" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#333" strokeWidth="1"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Dropdown menu for owner actions */}
                  {isOwner && (
                    <div className="dropdown-container" style={{ position: 'relative' }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={toggleDropdown}
                        style={{
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          border: '1px solid #ddd'
                        }}
                      >
                        <FaEllipsisV />
                      </button>
                      
                      {showDropdown && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: '180px',
                            marginTop: '4px'
                          }}
                        >
                          {!isEditMode ? (
                            <>
                              <button
                                className="btn btn-link w-100 text-start"
                                onClick={() => {
                                  enterEditMode();
                                  closeDropdown();
                                }}
                                style={{
                                  border: 'none',
                                  padding: '12px 16px',
                                  color: '#333',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <FaEdit />
                                Edit Listing
                              </button>
                              <button
                                className="btn btn-link w-100 text-start"
                                onClick={() => {
                                  handleDelete();
                                  closeDropdown();
                                }}
                                style={{
                                  border: 'none',
                                  padding: '12px 16px',
                                  color: '#dc3545',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <FaTrash />
                                Delete Listing
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-link w-100 text-start"
                                onClick={() => {
                                  exitEditMode();
                                  closeDropdown();
                                }}
                                disabled={savingChanges || uploadingPhotos}
                                style={{
                                  border: 'none',
                                  padding: '12px 16px',
                                  color: '#6c757d',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  opacity: (savingChanges || uploadingPhotos) ? 0.6 : 1
                                }}
                              >
                                <FaTimes />
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* User details card */}
              <div className="card p-4 d-flex align-items-center user-details-card" style={{ borderRadius: "2rem", minWidth: 0, marginTop: isOwnListing ? "40px" : "-30px" }}>
                <div className="d-flex align-items-center mb-3 w-100" style={{ gap: 16 }}>
                  {listing.user?.profilePicture && !failedImages.has(listing.user.userId) ? (
                    <img
                      src={
                        listing.user.profilePicture.startsWith('http')
                          ? listing.user.profilePicture
                          : `http://localhost:5000${listing.user.profilePicture}`
                      }
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
                    <span style={{ display: 'flex', alignItems: 'center', marginLeft: 12, color: '#fff', opacity: 0.8 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </span>
                  )}
                </button>
                {!isOwnListing && (
                  <button
                    className="btn btn-primary mt-2 w-100"
                    style={{ 
                      borderRadius: 18, 
                      fontSize: 20, 
                      fontWeight: 500, 
                      background: '#00aaff', 
                      border: 'none', 
                      padding: '12px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                    onClick={handleApplyToListing}
                  >
                    Apply to Listing
                  </button>
                )}
              </div>
              
              {/* Inline Likes List */}
              {listing.listingType === "entire_property" && (
                <div className="card p-4 mt-4" style={{ borderRadius: "2rem", minWidth: 0, minHeight: "380px", marginTop: isOwnListing ? "2rem" : "1.5rem" }}>
                  <div className="fw-bold mb-3">People who liked this listing ({likedUsers.length})</div>
                    <div className="list-group" style={{ maxHeight: "300px", overflowY: "auto", minHeight: "300px" }}>
                    {likedUsers.length === 0 ? (
                      <div className="list-group-item text-center text-muted py-4">
                        <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No likes yet</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Be the first to like this listing!</div>
                      </div>
                    ) : (
                      likedUsers.map((user) => {
                      if (user.userId === userId) {
                        return (
                          <div key={user.userId} className="list-group-item d-flex align-items-center gap-3 justify-content-between">
                            <Link
                              to={`/account/${user.userId}`}
                              className="d-flex align-items-center gap-3 flex-grow-1"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {user.profilePicture && !failedImages.has(user.userId) ? (
                                <img
                                  src={
                                    user.profilePicture.startsWith('http')
                                      ? user.profilePicture
                                      : `http://localhost:5000${user.profilePicture}`
                                  }
                                  alt={`${user.userFirstName} ${user.userLastName}`}
                                  className="rounded-circle"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  onError={() => handleImageError(user.userId)}
                                />
                              ) : (
                                <FaUserCircle 
                                  size={50} 
                                  color="#bbb" 
                                  style={{ background: '#eee', borderRadius: '50%' }} 
                                />
                              )}
                              <div>
                                <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                              </div>
                            </Link>
                          </div>
                        );
                      }
                      
                      // For other users, show Match button
                      return (
                        <div key={user.userId} className="list-group-item d-flex align-items-center gap-3">
                          <Link
                            to={`/account/${user.userId}`}
                            className="d-flex align-items-center gap-3"
                            style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                          >
                            {user.profilePicture && !failedImages.has(user.userId) ? (
                              <img
                                src={
                                  user.profilePicture.startsWith('http')
                                    ? user.profilePicture
                                    : `http://localhost:5000${user.profilePicture}`
                                }
                                alt={`${user.userFirstName} ${user.userLastName}`}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={() => handleImageError(user.userId)}
                              />
                            ) : (
                              <FaUserCircle 
                                size={50} 
                                color="#bbb" 
                                style={{ background: '#eee', borderRadius: '50%' }} 
                              />
                            )}
                            <div>
                              <h6 className="mb-0">{user.userFirstName} {user.userLastName}</h6>
                            </div>
                          </Link>
                          {!isOwnListing && (
                            <button
                              className="btn btn-outline-success"
                              style={{ 
                                minWidth: 80, 
                                borderRadius: 18,
                                fontSize: 14,
                                fontWeight: 500,
                                flexShrink: 0
                              }}
                              onClick={() => handleMatch(user.userId)}
                            >
                              Match
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                  </div>
                </div>
              )}
              
              {/* Map card */}
              <div className="card p-4 mt-4 map-card" style={{ borderRadius: "2rem", minWidth: 0, ...mapContainerStyle }}>
                <div className="fw-bold mb-2">Address</div>
                <div style={{ marginBottom: 12 }}>
                  Str {streetName} No. {streetNo}
                </div>
                <div style={{ height: '100%', minHeight: '300px' }}>
                  <MapPreview address={fullAddress} />
                </div>
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
        listingOwnerId={listing?.user?.userId}
      />
      
      {/* Add ApplyToListingModal */}
      <ApplyToListingModal
        show={showApplyModal}
        onHide={() => setShowApplyModal(false)}
        listingTitle={listing?.title || 'Apartment Listing'}
        listingId={listing?.listingId || 0}
        currentUserId={userId}
      />
    </div>
  );
};

export default ListingPage; 