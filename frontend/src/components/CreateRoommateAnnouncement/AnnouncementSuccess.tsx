import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoommateAnnouncement.css';

const AnnouncementSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="create-roommate-announcement">
      <div className="container">
        <div className="form-header">
          <h1>Announcement Created!</h1>
          <p>Your roommate announcement was posted successfully.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            className="btn btn-success"
            style={{ minWidth: 200, fontSize: '1.1rem' }}
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSuccess; 