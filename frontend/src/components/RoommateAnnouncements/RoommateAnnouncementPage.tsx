import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import LikesList or matching logic as needed

const RoommateAnnouncementPage: React.FC = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [hasPendingMatch, setHasPendingMatch] = useState(false);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [matchStatus, setMatchStatus] = useState<'none' | 'pending' | 'matched'>('none');

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!token);
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

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

  // Check if a match exists between current user and announcement owner
  useEffect(() => {
    const checkMatch = async () => {
      if (!currentUserId || !announcement?.user?.userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/matches/user/${currentUserId}`);
        if (!res.ok) return;
        const matches = await res.json();
        const found = matches.find((m: any) =>
          ((m.userAId === currentUserId && m.userBId === announcement.user.userId) ||
           (m.userBId === currentUserId && m.userAId === announcement.user.userId)) &&
          Number(m.announcementId) === Number(announcement.announcementId)
        );
        console.log('[MATCH DEBUG]', {
          currentUserId,
          announcementUserId: announcement.user.userId,
          announcementId: announcement.announcementId,
          foundMatch: found
        });
        if (found) {
          setMatchId(found.matchId);
          if (found.isMatch) {
            setMatchStatus('matched');
            setHasPendingMatch(false);
          } else {
            setMatchStatus('pending');
            setHasPendingMatch(true);
          }
        } else {
          setMatchStatus('none');
          setHasPendingMatch(false);
          setMatchId(null);
        }
      } catch (err) {
        setMatchStatus('none');
        setHasPendingMatch(false);
        setMatchId(null);
      }
    };
    if (announcement && currentUserId) checkMatch();
  }, [announcement, currentUserId]);

  // Handle match button click
  const handleMatchClick = async () => {
    // If not authenticated, open login modal
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    // If authenticated user is the owner, don't allow matching
    if (currentUserId === announcement.user?.userId) {
      alert('You cannot match with your own announcement.');
      return;
    }

    setMatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Debug log to verify correct user IDs
      console.log('Sending match request:', {
        userAId: currentUserId,
        userBId: announcement.user?.userId,
        actingUserId: currentUserId,
        announcementId: announcement.announcementId
      });
      const response = await fetch('http://localhost:5000/api/matches/roommate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userAId: currentUserId, // logged-in user (sender)
          userBId: announcement.user?.userId, // announcement owner (receiver)
          announcementId: announcement.announcementId,
          actingUserId: currentUserId // logged-in user (sender)
        })
      });

      if (response.ok) {
        const matchData = await response.json();
        setHasPendingMatch(true);
        setMatchId(matchData.matchId);
        alert('Match request sent! The announcement owner will be notified.');
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          alert('You cannot match with this announcement.');
        } else {
          alert(errorData.error || 'Failed to send match request');
        }
      }
    } catch (err) {
      console.error('Error creating match:', err);
      alert('Failed to send match request. Please try again.');
    } finally {
      setMatchLoading(false);
    }
  };

  // Handle cancel match
  const handleCancelMatch = async () => {
    if (!currentUserId || !announcement?.user?.userId) return;
    setMatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/matches/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userAId: currentUserId,
          userBId: announcement.user.userId,
          announcementId: announcement.announcementId
        })
      });
      if (response.ok) {
        setHasPendingMatch(false);
        setMatchId(null);
        alert('Match request cancelled.');
      } else {
        alert('Failed to cancel match request.');
      }
    } catch (err) {
      alert('Failed to cancel match request.');
    } finally {
      setMatchLoading(false);
    }
  };

  // Handle send message (redirect to chat)
  const handleSendMessage = async () => {
    if (!matchId) return;
    const currentUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/chat/from-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matchId, userId: currentUserId })
      });
      if (!res.ok) throw new Error('Failed to create/find chat room');
      const { chatRoomId } = await res.json();
      window.location.href = `/inbox?chatRoomId=${chatRoomId}`;
    } catch (err) {
      alert('Failed to start chat.');
    }
  };

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

  // Check if current user is the announcement owner
  const isOwner = currentUserId === announcement.user?.userId;

  // Log button rendering logic before return
  console.log('[BUTTON LOGIC]', { isOwner, matchStatus, hasPendingMatch, matchId });

  // TODO: Add user card, match button, and all details
  return (
    <div style={{ display: 'flex', gap: 40, maxWidth: 1200, margin: '40px auto', paddingTop: 100 }}>
      {/* Left: Big photo and user card */}
      <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ width: 360, height: 360, borderRadius: 18, overflow: 'hidden', background: '#eee', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          {/* Main image logic with profile picture fallback */}
          {(() => {
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
            
            return mainImage ? (
              <img
                src={mainImage}
                alt="Announcement Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 32 }}>No Photo</div>
            );
          })()}
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
          {/* Match/Cancel/Send Message button - only show if not the owner */}
          {!isOwner ? (
            matchStatus === 'matched' ? (
              <button
                onClick={handleSendMessage}
                style={{
                  marginTop: 18,
                  padding: '10px 28px',
                  borderRadius: 8,
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Send Message
              </button>
            ) : hasPendingMatch ? (
              <button
                onClick={handleCancelMatch}
                disabled={matchLoading}
                style={{
                  marginTop: 18,
                  padding: '10px 28px',
                  borderRadius: 8,
                  background: matchLoading ? '#ccc' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: matchLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {matchLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            ) : (
              <button
                onClick={handleMatchClick}
                disabled={matchLoading}
                style={{
                  marginTop: 18,
                  padding: '10px 28px',
                  borderRadius: 8,
                  background: matchLoading ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: matchLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {matchLoading ? 'Sending...' : 'Match'}
              </button>
            )
          ) : (
            <div style={{
              marginTop: 18,
              padding: '10px 28px',
              borderRadius: 8,
              background: '#28a745',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: 16,
              textAlign: 'center'
            }}>
              Your Announcement
            </div>
          )}
        </div>
      </div>
      {/* Right: Details */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 36 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>
          {announcement.user?.userFirstName} {announcement.user?.userLastName} is looking for a roommate
        </h2>
        <div style={{ marginBottom: 18, color: '#666' }}>{announcement.description}</div>

        {/* About Me Section */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontWeight: 600, fontSize: 22, marginBottom: 16, color: '#333' }}>About Me</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {announcement.fullName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Name:</span>
                <span>{announcement.fullName}</span>
              </div>
            )}
            {announcement.age && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Age:</span>
                <span>{announcement.age}</span>
              </div>
            )}
            {announcement.gender && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Gender:</span>
                <span>{announcement.gender}</span>
              </div>
            )}
            {announcement.occupation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Occupation:</span>
                <span>{announcement.occupation}</span>
              </div>
            )}
            {announcement.occupationOther && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Occupation (Other):</span>
                <span>{announcement.occupationOther}</span>
              </div>
            )}
            {announcement.workSchedule && announcement.workSchedule.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Work Schedule:</span>
                <span>{Array.isArray(announcement.workSchedule) ? announcement.workSchedule.join(', ') : announcement.workSchedule}</span>
              </div>
            )}
            {announcement.smoking && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Smoking:</span>
                <span>{announcement.smoking}</span>
              </div>
            )}
            {announcement.drinking && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Drinking:</span>
                <span>{announcement.drinking}</span>
              </div>
            )}
            {announcement.hasPets && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Has Pets:</span>
                <span>{announcement.hasPets}</span>
              </div>
            )}
            {announcement.petType && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Pet Type:</span>
                <span>{announcement.petType}</span>
              </div>
            )}
            {announcement.okayWithPets && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Okay With Pets:</span>
                <span>{announcement.okayWithPets}</span>
              </div>
            )}
            {announcement.cleanlinessLevelNum && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Cleanliness Level:</span>
                <span>{announcement.cleanlinessLevelNum}/5</span>
              </div>
            )}
            {announcement.socialPreferenceRaw && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Social Preference:</span>
                <span>{announcement.socialPreferenceRaw}</span>
              </div>
            )}
            {announcement.noiseLevelRaw && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Noise Level:</span>
                <span>{announcement.noiseLevelRaw}</span>
              </div>
            )}
            {announcement.sleepSchedule && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Sleep Schedule:</span>
                <span>{announcement.sleepSchedule}</span>
              </div>
            )}
            {announcement.visitorsOften && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Visitors Often:</span>
                <span>{announcement.visitorsOften}</span>
              </div>
            )}
            {announcement.languages && announcement.languages.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Languages:</span>
                <span>{Array.isArray(announcement.languages) ? announcement.languages.join(', ') : announcement.languages}</span>
              </div>
            )}
            {announcement.culturalBackground && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Cultural Background:</span>
                <span>{announcement.culturalBackground}</span>
              </div>
            )}
            {announcement.hobbies && announcement.hobbies.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Hobbies:</span>
                <span>{Array.isArray(announcement.hobbies) ? announcement.hobbies.join(', ') : announcement.hobbies}</span>
              </div>
            )}
            {announcement.locationAreas && announcement.locationAreas.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Preferred Cities:</span>
                <span>{announcement.locationAreas.join(', ')}</span>
              </div>
            )}
            {announcement.preferredAgeMin && announcement.preferredAgeMax && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Preferred Age Range:</span>
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
                <span style={{ fontWeight: 500, color: '#555' }}>Smoking Preference:</span>
                <span>{announcement.smokingPreference}</span>
              </div>
            )}
            {announcement.petPreference && announcement.petPreference !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Pet Preference:</span>
                <span>{announcement.petPreference}</span>
              </div>
            )}
            {announcement.cleanlinessLevel && announcement.cleanlinessLevel !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Cleanliness Preference:</span>
                <span>{announcement.cleanlinessLevel}</span>
              </div>
            )}
            {announcement.noiseLevel && announcement.noiseLevel !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Noise Preference:</span>
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