import React from 'react';
import { RoommateAnnouncement } from '../../types/roommate';
import './AnnouncementCard.css';
import { useNavigate } from 'react-router-dom';

interface AnnouncementCardProps {
  announcement: RoommateAnnouncement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const navigate = useNavigate();
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

  return (
    <div className="announcement-card horizontal-card modern-roommate-card" onClick={() => navigate(`/roommate-announcement/${announcement.announcementId}`)} style={{ cursor: 'pointer' }}>
      <div className="card-photo-section">
        {announcement.photos && announcement.photos.length > 0 ? (
          <div className="main-announcement-photo-wrapper">
            <img
              src={announcement.photos[0].url.startsWith('http') ? announcement.photos[0].url : `http://localhost:5000${announcement.photos[0].url}`}
              alt="Announcement Photo"
              className="main-announcement-photo"
            />
            {announcement.user?.profilePicture && (
              <img
                src={announcement.user.profilePicture.startsWith('http') ? announcement.user.profilePicture : `http://localhost:5000${announcement.user.profilePicture}`}
                alt="Profile"
                className="profile-picture-overlay"
              />
            )}
          </div>
        ) : announcement.user?.profilePicture ? (
          <img
            src={announcement.user.profilePicture.startsWith('http') ? announcement.user.profilePicture : `http://localhost:5000${announcement.user.profilePicture}`}
            alt="Profile"
            className="main-announcement-photo"
          />
        ) : (
          <div className="profile-picture-placeholder large">
            {announcement.user?.userFirstName?.[0] || 'U'}
          </div>
        )}
      </div>
      <div className="card-info-section">
        <div className="info-row">
          <span className="info-label">Age:</span>
          <span className="info-value">{getAge()}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Budget:</span>
          <span className="info-value">
            €{announcement.budgetMin} - €{announcement.budgetMax}/month
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Preferred Gender:</span>
          <span className="info-value">{announcement.preferredGender}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Occupation:</span>
          <span className="info-value">{announcement.userOccupation}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Preferred Cities:</span>
          <span className="info-value">{announcement.locationAreas && announcement.locationAreas.length > 0 ? announcement.locationAreas.join(', ') : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard; 