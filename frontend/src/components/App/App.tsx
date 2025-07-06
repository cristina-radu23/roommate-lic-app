import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../Navbar/Navbar';
import LoginModal from '../LoginModal/LoginModal';
import CreateAccount from '../CreateAccount/CreateAccount';
import PostListing from '../PostListing/PostListing';
import HomePage from '../HomePage/HomePage';
import ListingPage from '../ListingPage';
import Inbox from '../Inbox/Inbox';
import MyPosts from '../MyListings/MyListings';
import AccountInfo from '../AccountInfo/AccountInfo';
import Favourites from '../Favourites';
import RoommateAnnouncements from '../RoommateAnnouncements/RoommateAnnouncements';
import CreateRoommateAnnouncement from '../CreateRoommateAnnouncement/CreateRoommateAnnouncement';
import AnnouncementSuccess from '../CreateRoommateAnnouncement/AnnouncementSuccess';
import RoommateAnnouncementPage from '../RoommateAnnouncements/RoommateAnnouncementPage';
import IdealRoommateForm from '../IdealRoommateForm/IdealRoommateForm';

// Add TypeScript declaration for global navigation
declare global {
  interface Window {
    navigateTo: (path: string) => void;
  }
}

function App({ navigate }: { navigate: (path: string) => void }) {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { isLoggedIn, isValidating } = useAuth();

  useEffect(() => {
    const handler = () => setLoginModalOpen(true);
    window.addEventListener('open-login-modal', handler);
    return () => window.removeEventListener('open-login-modal', handler);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.userId) localStorage.setItem("userId", data.userId.toString());
        // Dispatch a custom event to notify components about the login
        window.dispatchEvent(new CustomEvent('user-login'));
        setLoginModalOpen(false);
        // Only redirect if we're on the CreateAccount page
        if (window.location.pathname === '/createaccount') {
          window.location.href = '/';
        }
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      alert("Login failed. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    // Dispatch a custom event to notify components about the logout
    window.dispatchEvent(new CustomEvent('user-logout'));
    navigate('/');
  };

  // Add global navigation function
  const globalNavigate = (path: string) => {
    navigate(path);
  };

  // Make navigation available globally
  window.navigateTo = globalNavigate;

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div style={{ 
        backgroundColor: "#fcfaf8",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#fcfaf8",
      minHeight: "100vh",
      width: "100%"
    }}>
      <Navbar
        onLoginClick={() => setLoginModalOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <LoginModal
        show={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSubmit={handleLogin}
      />
      <Routes>
        <Route path="/createaccount" element={<CreateAccount onLoginClick={() => setLoginModalOpen(true)} />} />
        <Route path="/postListing" element={<PostListing />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/mylistings" element={<MyPosts />} />
        <Route path="/account" element={<AccountInfo />} />
        <Route path="/account/:userId" element={<AccountInfo />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/recommendations" element={<HomePage />} />
        <Route path="/roommate-announcements" element={<RoommateAnnouncements />} />
        <Route path="/create-roommate-announcement" element={<CreateRoommateAnnouncement />} />
        <Route path="/announcement-success" element={<AnnouncementSuccess />} />
        <Route path="/roommate-announcement/:id" element={<RoommateAnnouncementPage />} />
        <Route path="/roommate-recommendations" element={<HomePage />} />
        <Route path="/ideal-roommate-form" element={<IdealRoommateForm />} />
      </Routes>
    </div>
  );
}

function AppWithRouter() {
  const navigate = useNavigate();
  return <App navigate={navigate} />;
}

export default function AppRoot() {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}
