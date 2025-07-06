import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isValidating, setIsValidating] = useState(true);

  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsValidating(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        window.dispatchEvent(new CustomEvent('user-logout'));
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      window.dispatchEvent(new CustomEvent('user-logout'));
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    // Initial validation
    validateToken();
  }, []);

  // Set up periodic token validation (every 30 minutes)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      validateToken();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    const handleLogin = () => {
      setIsLoggedIn(true);
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener('user-login', handleLogin);
    window.addEventListener('user-logout', handleLogout);

    return () => {
      window.removeEventListener('user-login', handleLogin);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  return { isLoggedIn, isValidating };
}; 