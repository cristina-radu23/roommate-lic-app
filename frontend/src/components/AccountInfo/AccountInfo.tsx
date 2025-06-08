import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

interface UserInfo {
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth: string;
  gender: string;
  occupation?: string;
}

const AccountInfo: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<'profile' | 'settings'>('profile');
  const [editFields, setEditFields] = useState<UserInfo | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const isViewingOtherProfile = userId !== undefined && userId !== localStorage.getItem('userId');

  useEffect(() => {
    // Set the active submenu from navigation state if available
    if (location.state?.activeSubmenu) {
      setSelectedMenu(location.state.activeSubmenu);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token && !isViewingOtherProfile) {
          navigate('/');
          return;
        }

        const url = isViewingOtherProfile 
          ? `http://localhost:5000/api/users/${userId}`
          : 'http://localhost:5000/api/users/me';

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (!isViewingOtherProfile) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          if (response.status === 401 && !isViewingOtherProfile) {
            localStorage.removeItem('token');
            navigate('/');
            return;
          }
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Failed to fetch user info: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched user data:', data);
        // Ensure gender has a default value if not set
        const userData = {
          ...data,
          gender: data.gender || 'not specified'
        };
        setUser(userData);
        setEditFields(userData);
        setIsDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching user info');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [navigate, userId, isViewingOtherProfile]);

  useEffect(() => {
    setImgError(false); // Reset image error when profilePicture changes
  }, [user?.profilePicture]);

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
        setError('Not authenticated');
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
          gender: editFields.gender,
          dateOfBirth: editFields.dateOfBirth,
          occupation: editFields.occupation
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear local storage and redirect to home
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.dispatchEvent(new CustomEvent('user-logout'));
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
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
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: user.profilePicture && !imgError ? 'none' : '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#adb5bd', overflow: 'hidden' }}>
                {user.profilePicture && !imgError ? (
                  <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span><i className="bi bi-person" /></span>
                )}
              </div>
              {!isViewingOtherProfile && (
                <>
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
                </>
              )}
            </div>
            <div>
              <h3 className="mb-1">Hi {user.userFirstName} {user.userLastName}</h3>
              {!isViewingOtherProfile && <div className="text-muted">{user.email}</div>}
            </div>
          </div>
          {!isViewingOtherProfile && (
            <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleLogout}>
              <span className="me-2"><i className="bi bi-box-arrow-right" /></span> Log out
            </button>
          )}
        </div>
        {/* Main content with side menu */}
        <div className="d-flex" style={{ gap: 32 }}>
          {/* Side menu */}
          {!isViewingOtherProfile && (
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
          )}
          {/* Main content area */}
          <div style={{ flex: 1 }}>
            {selectedMenu === 'profile' && (
              <form onSubmit={handleSave}>
                <h4 className="mb-4">Profile</h4>
                <div className="mb-3">
                  <label className="form-label">About me</label>
                  <textarea
                    className="form-control"
                    value={typeof editFields.bio === 'string' ? editFields.bio : ''}
                    onChange={e => handleFieldChange('bio', e.target.value)}
                    rows={3}
                    disabled={isViewingOtherProfile}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">First name</label>
                  <input
                    className="form-control"
                    value={editFields.userFirstName}
                    onChange={e => handleFieldChange('userFirstName', e.target.value)}
                    disabled={isViewingOtherProfile}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-control"
                    value={editFields.userLastName}
                    onChange={e => handleFieldChange('userLastName', e.target.value)}
                    disabled={isViewingOtherProfile}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editFields.dateOfBirth ? new Date(editFields.dateOfBirth).toISOString().split('T')[0] : ''}
                    disabled={true}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    name="gender"
                    value={editFields.gender || "not specified"}
                    disabled={true}
                  >
                    <option value="not specified">Select your gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                {!isViewingOtherProfile && (
                  <>
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
                        disabled={isViewingOtherProfile}
                      />
                    </div>
                  </>
                )}
                <div className="col-12 mb-3 d-flex justify-content-center" style={{ paddingBottom: "40px" }}>
                  <button
                    type="submit"
                    className="btn"
                    style={{ 
                      backgroundColor: "#a1cca7", 
                      borderColor: "#a1cca7", 
                      color: "white",
                      width: "25%",
                      borderRadius: "8px",
                      padding: "0.375rem 1rem"
                    }}
                    disabled={!isDirty || saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  {isDirty && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary ms-2"
                      onClick={() => {
                        setEditFields(user);
                        setIsDirty(false);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
            {selectedMenu === 'settings' && !isViewingOtherProfile && (
              <div>
                <h4 className="mb-4">Settings</h4>
                <div className="mb-4" style={{ maxWidth: 400 }}>
                  <h5 className="mb-3">Change Password</h5>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword) {
                      setPasswordError('All fields are required.');
                      return;
                    }
                    if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
                      setPasswordError('New passwords do not match.');
                      return;
                    }
                    setPasswordSaving(true);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        navigate('/');
                        return;
                      }
                      const response = await fetch('http://localhost:5000/api/users/change-password', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          currentPassword: passwordFields.currentPassword,
                          newPassword: passwordFields.newPassword
                        })
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        setPasswordError(data.error || 'Failed to change password');
                      } else {
                        setPasswordSuccess('Password changed successfully!');
                        setPasswordFields({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                      }
                    } catch (err) {
                      setPasswordError('Failed to change password');
                    } finally {
                      setPasswordSaving(false);
                    }
                  }}>
                    <div className="mb-3">
                      <label className="form-label">Current password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordFields.currentPassword}
                        onChange={e => setPasswordFields(f => ({ ...f, currentPassword: e.target.value }))}
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordFields.newPassword}
                        onChange={e => setPasswordFields(f => ({ ...f, newPassword: e.target.value }))}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm new password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordFields.confirmNewPassword}
                        onChange={e => setPasswordFields(f => ({ ...f, confirmNewPassword: e.target.value }))}
                        autoComplete="new-password"
                      />
                    </div>
                    {passwordError && <div className="text-danger mb-2">{passwordError}</div>}
                    {passwordSuccess && <div className="text-success mb-2">{passwordSuccess}</div>}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordSaving || !passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword || passwordFields.newPassword !== passwordFields.confirmNewPassword}
                    >
                      {passwordSaving ? 'Saving...' : 'Change Password'}
                    </button>
                  </form>
                </div>
                <div className="text-muted">Other settings coming soon...</div>
                
                {/* Delete Account Section */}
                <div className="mt-5" style={{ maxWidth: 400 }}>
                  <h5 className="mb-3 text-danger">Delete Account</h5>
                  <p className="text-muted mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ marginBottom: 100 }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          {deleteError && <div className="text-danger mb-3">{deleteError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountInfo; 