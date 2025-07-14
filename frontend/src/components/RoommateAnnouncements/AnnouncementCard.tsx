import React, { useState } from 'react';
import { RoommateAnnouncement } from '../../types/roommate';
import './AnnouncementCard.css';
import '../RoommateRecommendations/RoommateRecommendations.css';
import { useNavigate } from 'react-router-dom';

interface AnnouncementCardProps {
  announcement: RoommateAnnouncement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const navigate = useNavigate();
  const [profileImageError, setProfileImageError] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  
  // Debug logs
  console.log('[AnnouncementCard] Full announcement:', announcement);
  if (announcement.photos && announcement.photos.length > 0) {
    console.log('[AnnouncementCard] First photo URL:', announcement.photos[0].url);
  }
  if (announcement.user?.profilePicture) {
    console.log('[AnnouncementCard] User profile picture:', announcement.user.profilePicture);
  }

  // Calculate age if possible
  const getAge = () => {
    if (announcement.userAgeMin && announcement.userAgeMax) {
      return `${announcement.userAgeMin} - ${announcement.userAgeMax}`;
    }
    return 'N/A';
  };

  // Main image logic
  let mainImage = '';
  if (announcement.photos && announcement.photos.length > 0) {
    mainImage = announcement.photos[0].url.startsWith('http')
      ? announcement.photos[0].url
      : `http://localhost:5000${announcement.photos[0].url}`;
  } else if (announcement.user?.profilePicture) {
    mainImage = announcement.user.profilePicture.startsWith('http')
      ? announcement.user.profilePicture
      : `http://localhost:5000${announcement.user.profilePicture}`;
  }

  return (
    <div
      className="recommendation-card"
      style={{ cursor: 'pointer', minHeight: 380 }}
      onClick={() => navigate(`/roommate-announcement/${announcement.announcementId}`)}
    >
      <div className="listing-link">
        <div className="listing-image" style={{ height: 220, position: 'relative' }}>
          {mainImage && !mainImageError ? (
            <img 
              src={mainImage} 
              alt="Main" 
              onError={() => setMainImageError(true)}
            />
          ) : (
            <div className="placeholder-image">👤</div>
          )}
        </div>
        <div className="listing-info" style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          {/* Profile picture as circle */}
          <div style={{ minWidth: 56, marginTop: 2 }}>
            {announcement.user?.profilePicture && !profileImageError ? (
              <img
                src={announcement.user.profilePicture.startsWith('http') ? announcement.user.profilePicture : `http://localhost:5000${announcement.user.profilePicture}`}
                alt="Profile"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#c3cfe2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, border: '2px solid #e0e0e0' }}>
                {announcement.user?.userFirstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="listing-title">
              {announcement.user?.userFirstName} {announcement.user?.userLastName}
            </h3>
            <p className="listing-location">
              {announcement.locationAreas && announcement.locationAreas.length > 0
                ? announcement.locationAreas.join(', ')
                : 'Location not specified'}
            </p>
            <p className="listing-details">
              Age: {getAge()} &nbsp;|&nbsp; Gender: {announcement.preferredGender}
            </p>
            <p className="listing-details">
              Occupation: {announcement.userOccupation}
            </p>
            <p className="listing-details">
              Budget: €{announcement.budgetMin} - €{announcement.budgetMax}/month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard; 