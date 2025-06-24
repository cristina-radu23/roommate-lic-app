import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostListingFormData } from '../PostListing/types';
import { RoommateAnnouncement } from '../../types/roommate';
import ListingsGrid from '../HomePage/ListingsGrid';
import AnnouncementCard from '../RoommateAnnouncements/AnnouncementCard';

const MyPosts: React.FC = () => {
  const [listings, setListings] = useState<PostListingFormData[]>([]);
  const [announcements, setAnnouncements] = useState<RoommateAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'announcements'>('listings');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        // Fetch listings
        const listingsResponse = await fetch('http://localhost:5000/api/listings/user/listings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!listingsResponse.ok) {
          if (listingsResponse.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch listings');
        }

        const listingsData = await listingsResponse.json();
        setListings(listingsData);

        // Fetch roommate announcements
        const announcementsResponse = await fetch('http://localhost:5000/api/roommate-announcements/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          setAnnouncements(announcementsData.data || []);
        }

      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [navigate]);

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/roommate-announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAnnouncements(current => current.filter(a => a.announcementId !== announcementId));
      } else {
        alert('Failed to delete announcement');
      }
    } catch (err) {
      alert('Error deleting announcement');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f8f9fa", 
      height: "100%",
      width: "100%",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <div style={{ 
        paddingTop: "80px",
        height: "100%",
        overflowY: "auto"
      }}>
        <div className="container-fluid" style={{ 
          maxWidth: "1200px", 
          margin: "0 auto"
        }}>
          <h2 className="mb-4">My Posts</h2>
          
          {/* Tab Navigation */}
          <div className="mb-4">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('listings')}
                >
                  Listings ({listings.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('announcements')}
                >
                  Roommate Announcements ({announcements.length})
                </button>
              </li>
            </ul>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <>
              {listings.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  You haven't created any listings yet. <a href="/postListing" className="alert-link">Create your first listing</a>
                </div>
              ) : (
                <ListingsGrid listings={listings} isLoggedIn={!!localStorage.getItem('token')} showDeleteButton={true} />
              )}
            </>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <>
              {announcements.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  You haven't created any roommate announcements yet. <a href="/create-roommate-announcement" className="alert-link">Create your first announcement</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
                  {announcements.map((announcement) => (
                    <div key={announcement.announcementId} style={{ position: 'relative', width: '100%', maxWidth: 900 }}>
                      <AnnouncementCard announcement={announcement} />
                      <button
                        className="btn btn-danger"
                        style={{ 
                          position: 'absolute', 
                          top: 16, 
                          right: 16, 
                          zIndex: 3, 
                          padding: '4px 12px', 
                          fontSize: 14 
                        }}
                        onClick={() => handleDeleteAnnouncement(announcement.announcementId)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts; 