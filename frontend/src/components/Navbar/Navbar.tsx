import { Link } from "react-router-dom";
import { FaUserCircle, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

interface NavbarProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, isLoggedIn, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top" style={{ zIndex: 10 }}>
      <div className="container">
        <Link className="navbar-brand" to="/">Roommate Finder</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={onLoginClick}>
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/createaccount">Sign Up</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative" to="/inbox">
                    <FaEnvelope size={22} />
                  </Link>
                </li>
                <li
                  className="nav-item dropdown"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="nav-link dropdown-toggle d-flex align-items-center" role="button">
                    <FaUserCircle size={24} className="me-1" />
                    Profile
                  </span>
                  {showDropdown && (
                    <ul className="dropdown-menu dropdown-menu-end show" style={{ position: "absolute" }}>
                      <li><Link className="dropdown-item" to="/wishlist">My Wishlist</Link></li>
                      <li><Link className="dropdown-item" to="/account">Account Information</Link></li>
                      <li><Link className="dropdown-item" to="/mylistings">My Listings</Link></li>
                      <li><Link className="dropdown-item" to="/postListing">Create a Listing</Link></li>
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
