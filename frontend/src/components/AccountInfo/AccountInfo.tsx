import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
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
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff' }}>
            <span><i className="bi bi-person" /></span>
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