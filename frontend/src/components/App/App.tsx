import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from '../Navbar/Navbar';
import LoginModal from '../LoginModal/LoginModal';
import CreateAccount from '../CreateAccount/CreateAccount';
import PostListing from '../PostListing/PostListing';
import HomePage from '../HomePage/HomePage';
import ListingPage from '../ListingPage';
import Inbox from '../Inbox/Inbox';
import MyListings from '../MyListings/MyListings';
import AccountInfo from '../AccountInfo/AccountInfo';
import Favourites from '../Favourites';

// Add TypeScript declaration for global navigation
declare global {
  interface Window {
    navigateTo: (path: string) => void;
  }
}

function App({ navigate }: { navigate: (path: string) => void }) {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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
        setIsLoggedIn(true);
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
    setIsLoggedIn(false);
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
        <Route path="/createaccount" element={<CreateAccount navigate={navigate} />} />
        <Route path="/postListing" element={<PostListing />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/mylistings" element={<MyListings />} />
        <Route path="/account" element={<AccountInfo />} />
        <Route path="/account/:userId" element={<AccountInfo />} />
        <Route path="/favourites" element={<Favourites />} />
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
