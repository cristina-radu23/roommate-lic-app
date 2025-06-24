import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import LikesList or matching logic as needed

const RoommateAnnouncementPage: React.FC = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/roommate-announcements/${id}`);
        const data = await res.json();
        setAnnouncement(data.data);
      } catch (err) {
        setError('Failed to fetch announcement');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;
  if (!announcement) return <div style={{ padding: 40 }}>Announcement not found.</div>;

  // Parse JSON fields if needed
  if (typeof announcement.locationPreferences === 'string') {
    try { announcement.locationPreferences = JSON.parse(announcement.locationPreferences); } catch { announcement.locationPreferences = []; }
  }
  if (typeof announcement.mustHaveAmenities === 'string') {
    try { announcement.mustHaveAmenities = JSON.parse(announcement.mustHaveAmenities); } catch { announcement.mustHaveAmenities = []; }
  }
  if (typeof announcement.dealBreakers === 'string') {
    try { announcement.dealBreakers = JSON.parse(announcement.dealBreakers); } catch { announcement.dealBreakers = []; }
  }

  // TODO: Add user card, match button, and all details
  return (
    <div style={{ display: 'flex', gap: 40, maxWidth: 1200, margin: '40px auto', paddingTop: 100 }}>
      {/* Left: Big photo and user card */}
      <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ width: 360, height: 360, borderRadius: 18, overflow: 'hidden', background: '#eee', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          {announcement.photos && announcement.photos.length > 0 ? (
            <img
              src={announcement.photos[0].url.startsWith('http') ? announcement.photos[0].url : `http://localhost:5000${announcement.photos[0].url}`}
              alt="Announcement Photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 32 }}>No Photo</div>
          )}
        </div>
        {/* User card placeholder */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24, textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            {announcement.user?.profilePicture ? (
              <img
                src={announcement.user.profilePicture.startsWith('http') ? announcement.user.profilePicture : `http://localhost:5000${announcement.user.profilePicture}`}
                alt="Profile"
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#bbb' }}>
                {announcement.user?.userFirstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{announcement.user?.userFirstName} {announcement.user?.userLastName}</div>
          {/* TODO: Add match button here */}
          <button style={{ marginTop: 18, padding: '10px 28px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
            Match
          </button>
        </div>
      </div>
      {/* Right: Details */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>
          {announcement.user?.userFirstName} {announcement.user?.userLastName} is looking for a roommate
        </h2>
        <div style={{ marginBottom: 18, color: '#666' }}>{announcement.description}</div>
        
        {/* Clean table format for details */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#333' }}>Preferences</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {announcement.preferredAgeMin && announcement.preferredAgeMax && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Age Range:</span>
                <span>{announcement.preferredAgeMin} - {announcement.preferredAgeMax}</span>
              </div>
            )}
            {announcement.budgetMin && announcement.budgetMax && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Budget:</span>
                <span>€{announcement.budgetMin} - €{announcement.budgetMax}/month</span>
              </div>
            )}
            {announcement.preferredGender && announcement.preferredGender !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Preferred Gender:</span>
                <span>{announcement.preferredGender}</span>
              </div>
            )}
            {announcement.preferredOccupation && announcement.preferredOccupation !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Preferred Occupation:</span>
                <span>{announcement.preferredOccupation}</span>
              </div>
            )}
            {announcement.smokingPreference && announcement.smokingPreference !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Smoking:</span>
                <span>{announcement.smokingPreference}</span>
              </div>
            )}
            {announcement.petPreference && announcement.petPreference !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Pets:</span>
                <span>{announcement.petPreference}</span>
              </div>
            )}
            {announcement.cleanlinessLevel && announcement.cleanlinessLevel !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Cleanliness:</span>
                <span>{announcement.cleanlinessLevel}</span>
              </div>
            )}
            {announcement.noiseLevel && announcement.noiseLevel !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Noise Level:</span>
                <span>{announcement.noiseLevel}</span>
              </div>
            )}
            {announcement.studyHabits && announcement.studyHabits !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Study Habits:</span>
                <span>{announcement.studyHabits}</span>
              </div>
            )}
            {announcement.socialPreference && announcement.socialPreference !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Social Preference:</span>
                <span>{announcement.socialPreference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location and other preferences */}
        {announcement.locationPreferences && announcement.locationPreferences.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#333' }}>Preferred Areas</h3>
            <div style={{ color: '#666', lineHeight: 1.5 }}>{announcement.locationPreferences.join(', ')}</div>
          </div>
        )}
        
        {announcement.mustHaveAmenities && announcement.mustHaveAmenities.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#333' }}>Must Have Amenities</h3>
            <div style={{ color: '#666', lineHeight: 1.5 }}>{announcement.mustHaveAmenities.join(', ')}</div>
          </div>
        )}
        
        {announcement.dealBreakers && announcement.dealBreakers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#333' }}>Deal Breakers</h3>
            <div style={{ color: '#666', lineHeight: 1.5 }}>{announcement.dealBreakers.join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateAnnouncementPage; 