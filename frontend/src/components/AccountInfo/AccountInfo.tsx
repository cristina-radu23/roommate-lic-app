import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
}

const AccountInfo: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        console.log('Fetching user info...');
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          const errorData = await response.json().catch(() => null);
          console.error('Error response:', errorData);
          throw new Error(errorData?.error || `Failed to fetch user info: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data received:', data);
        setUser(data);
      } catch (err) {
        console.error('Error in fetchUserInfo:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Show loading state
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/users/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const data = await response.json();
      
      // Update user state with new profile picture
      setUser(prev => prev ? { ...prev, profilePicture: data.url } : null);
      
      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }
  if (error) {
    return <div className="container mt-5 text-danger">{error}</div>;
  }
  if (!user) return null;

  return (
    <div className="w-100" style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', padding: '32px 0 24px 0', marginTop: '56px' }}>
      <div className="container d-flex justify-content-between align-items-center" style={{maxWidth: 900}}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: user.profilePicture ? 'none' : 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff', overflow: 'hidden' }}>
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span><i className="bi bi-person" /></span>
              )}
            </div>
            <label 
              htmlFor="profilePictureUpload" 
              className="btn position-absolute bottom-0 end-0" 
              style={{ 
                cursor: 'pointer', 
                padding: '4px 8px', 
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translate(25%, 25%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: '#6c757d'
              }}
            >
              <i className="bi bi-pencil" style={{ fontSize: '14px' }} />
            </label>
            <input
              type="file"
              id="profilePictureUpload"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <h3 className="mb-1">Hi {user.userFirstName} {user.userLastName}</h3>
            <div className="text-muted">{user.email}</div>
          </div>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleLogout}>
          <span className="me-2"><i className="bi bi-box-arrow-right" /></span> Log out
        </button>
      </div>
    </div>
  );
};

export default AccountInfo; 