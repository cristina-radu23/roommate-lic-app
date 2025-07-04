import { Link } from "react-router-dom";
import { FaUserCircle, FaEnvelope, FaBell } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import NotificationPopup from "./NotificationPopup";

interface NavbarProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface UserInfo {
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, isLoggedIn, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [imgError, setImgError] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userId = Number(localStorage.getItem('userId'));
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) {
        setUser(null);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [isLoggedIn]);

  useEffect(() => {
    setImgError(false); // Reset image error when user/profilePicture changes
  }, [user?.profilePicture, isLoggedIn]);

  // Reset dropdown state when login state changes
  useEffect(() => {
    setShowDropdown(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setHasUnread(false);
      return;
    }
    const fetchUnread = () => {
      fetch(`http://localhost:5000/api/chat/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          setHasUnread(data.some((chat: any) => chat.unreadCount && chat.unreadCount > 0));
        });
    };
    fetchUnread();
    // Listen for custom event to refresh unread status
    window.addEventListener('refresh-unread', fetchUnread);
    return () => {
      window.removeEventListener('refresh-unread', fetchUnread);
    };
  }, [isLoggedIn, userId, location.pathname]);

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{ 
      zIndex: 10000,
      backgroundColor: "#097C87",
      color: "white"
    }}>
      <div className="container">
        <Link 
          className="navbar-brand" 
          to="/"
          style={{ color: "white" }}
          onClick={() => {
            // Dispatch event to reset filters
            window.dispatchEvent(new CustomEvent('reset-filters'));
          }}
        >
          Room<span style={{ color: "#f92c85", fontWeight: "bold" }}>BUDDY</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" style={{ borderColor: "white" }}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={onLoginClick} style={{ color: "white" }}>
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/createaccount" style={{ color: "white" }}>Sign Up</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2" style={{ position: 'relative' }}>
                  <span className="nav-link position-relative" style={{ cursor: 'pointer', color: "white" }} onClick={() => setShowNotifications((v) => !v)}>
                    <FaBell size={22} />
                    {hasNotifications && (
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 4,
                        width: 10,
                        height: 10,
                        background: 'red',
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '2px solid white',
                        zIndex: 2
                      }} />
                    )}
                  </span>
                  {showNotifications && userId && (
                    <NotificationPopup
                      open={showNotifications}
                      onClose={() => setShowNotifications(false)}
                      userId={userId}
                      onAnyUnread={setHasNotifications}
                    />
                  )}
                </li>
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative" to="/inbox" style={{ color: "white" }}>
                    <FaEnvelope size={22} />
                    {hasUnread && (
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 4,
                        width: 10,
                        height: 10,
                        background: 'red',
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '2px solid white',
                        zIndex: 2
                      }} />
                    )}
                  </Link>
                </li>
                <li
                  className="nav-item dropdown"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="nav-link dropdown-toggle d-flex align-items-center" role="button" style={{ color: "white" }}>
                    {user && user.profilePicture && !imgError ? (
                      <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                        alt="Profile"
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, border: '1px solid white' }}
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <FaUserCircle size={24} className="me-1" />
                    )}
                    Profile
                  </span>
                  {showDropdown && (
                    <ul className="dropdown-menu dropdown-menu-end show" style={{ position: "absolute" }}>
                      <li><Link className="dropdown-item" to="/favourites">Favourites</Link></li>
                      <li><Link className="dropdown-item" to="/recommendations">Recommendations</Link></li>
                      <li><Link className="dropdown-item" to="/account">Account</Link></li>
                      <li><Link className="dropdown-item" to="/mylistings">My Posts</Link></li>
                      <li><Link className="dropdown-item" to="/postListing">Add listing</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item" to="/roommate-announcements">Find Roommates</Link></li>
                      <li><Link className="dropdown-item" to="/roommate-recommendations">Recommended for You</Link></li>
                      <li><Link className="dropdown-item" to="/create-roommate-announcement">Create Roommate Announcement</Link></li>
                      <li><button className="dropdown-item" onClick={onLogout}>Logout</button></li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;