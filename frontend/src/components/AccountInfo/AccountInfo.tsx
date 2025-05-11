import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  bio?: string;
}

const AccountInfo: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<'profile' | 'settings'>('profile');
  const [editFields, setEditFields] = useState<UserInfo | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Failed to fetch user info: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched user data:', data);
        setUser(data);
        setEditFields(data);
        setIsDirty(false);
      } catch (err) {
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
      setUser(prev => prev ? { ...prev, profilePicture: data.url } : null);
      setEditFields(prev => prev ? { ...prev, profilePicture: data.url } : null);
      setIsDirty(true);
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof UserInfo, value: string) => {
    setEditFields(prev => prev ? { ...prev, [field]: value } : null);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!editFields) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userFirstName: editFields.userFirstName,
          userLastName: editFields.userLastName,
          phoneNumber: editFields.phoneNumber,
          bio: editFields.bio,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update profile');
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditFields(updatedUser);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }
  if (error) {
    return <div className="container mt-5 text-danger">{error}</div>;
  }
  if (!user || !editFields) return null;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', marginTop: 56 }}>
      <div className="container" style={{ maxWidth: 1100, paddingTop: 32 }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: 24 }}>
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
        {/* Main content with side menu */}
        <div className="d-flex" style={{ marginTop: 32 }}>
          {/* Side menu */}
          <div style={{ minWidth: 180, borderRight: '1px solid #e0e0e0', paddingRight: 0 }}>
            <ul className="nav flex-column" style={{ gap: 4 }}>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start${selectedMenu === 'profile' ? ' active fw-bold' : ''}`}
                  style={{ background: 'none', border: 'none', color: selectedMenu === 'profile' ? '#212529' : '#6c757d', cursor: 'pointer', padding: '10px 16px', borderRadius: 6 }}
                  onClick={() => setSelectedMenu('profile')}
                >
                  Profile
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link w-100 text-start${selectedMenu === 'settings' ? ' active fw-bold' : ''}`}
                  style={{ background: 'none', border: 'none', color: selectedMenu === 'settings' ? '#212529' : '#6c757d', cursor: 'pointer', padding: '10px 16px', borderRadius: 6 }}
                  onClick={() => setSelectedMenu('settings')}
                >
                  Settings
                </button>
              </li>
            </ul>
          </div>
          {/* Main content area */}
          <div style={{ flex: 1, paddingLeft: 48 }}>
            {selectedMenu === 'profile' && (
              <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <h4 className="mb-4">Profile</h4>
                <div className="mb-3">
                  <label className="form-label">About me</label>
                  <textarea
                    className="form-control"
                    value={typeof editFields.bio === 'string' ? editFields.bio : ''}
                    onChange={e => handleFieldChange('bio', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">First name</label>
                  <input
                    className="form-control"
                    value={editFields.userFirstName}
                    onChange={e => handleFieldChange('userFirstName', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-control"
                    value={editFields.userLastName}
                    onChange={e => handleFieldChange('userLastName', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={editFields.email} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone number</label>
                  <input
                    className="form-control"
                    value={editFields.phoneNumber}
                    onChange={e => handleFieldChange('phoneNumber', e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={!isDirty || saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </form>
            )}
            {selectedMenu === 'settings' && (
              <div>
                <h4 className="mb-4">Settings</h4>
                <div className="text-muted">Settings content coming soon...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo; 