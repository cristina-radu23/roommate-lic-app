import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from '../Navbar/Navbar';
import LoginModal from '../LoginModal/LoginModal';
import CreateAccount from '../CreateAccount/CreateAccount';
import PostListing from '../PostListing/PostListing';
import HomePage from '../HomePage/HomePage';
import ListingPage from '../ListingPage';
import Inbox from '../Inbox/Inbox';

function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
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
    setIsLoggedIn(false);
  };

  return (
    <Router>
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
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/postListing" element={<PostListing />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
