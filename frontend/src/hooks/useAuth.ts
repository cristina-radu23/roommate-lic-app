import { useState, useEffect, useRef } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isValidating, setIsValidating] = useState(true);
  const validationInProgress = useRef(false);

  const validateToken = async () => {
    // Prevent multiple simultaneous validations
    if (validationInProgress.current) {
      console.log('[useAuth] Validation already in progress, skipping');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsValidating(false);
      return;
    }

    validationInProgress.current = true;
    try {
      const response = await fetch("http://localhost:5000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else if (response.status === 401 || response.status === 403) {
        // Only logout on actual authentication errors, not network errors
        console.log('[useAuth] Token validation failed with status:', response.status);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        window.dispatchEvent(new CustomEvent('user-logout'));
      } else {
        // For other errors (like 500), don't logout - just log the error
        console.log('[useAuth] Token validation failed with non-auth error:', response.status);
      }
    } catch (error) {
      // For network errors, don't logout - just log the error
      console.log('[useAuth] Token validation network error:', error);
      // Only logout if we're sure it's an authentication issue
      // For now, we'll keep the user logged in on network errors
    } finally {
      setIsValidating(false);
      validationInProgress.current = false;
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