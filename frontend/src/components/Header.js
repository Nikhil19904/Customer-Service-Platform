import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll event to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark ${scrolled ? 'navbar-scrolled' : 'bg-transparent'} fixed-top`}>
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-text">
            <i className="bi bi-headset me-2 brand-icon"></i>
            Customer Service Platform
          </span>
        </Link>
        <button
          className={`navbar-toggler ${menuOpen ? 'open' : ''}`}
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={menuOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
        >
          <span className="toggler-icon top-bar"></span>
          <span className="toggler-icon middle-bar"></span>
          <span className="toggler-icon bottom-bar"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <i className="bi bi-house-door me-1 nav-icon"></i>
                <span className="nav-text">Home</span>
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                    to="/dashboard"
                  >
                    <i className="bi bi-speedometer2 me-1 nav-icon"></i>
                    <span className="nav-text">Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/new-request' ? 'active' : ''}`} 
                    to="/new-request"
                  >
                    <i className="bi bi-plus-circle me-1 nav-icon"></i>
                    <span className="nav-text">New Request</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn btn-link">
                    <i className="bi bi-box-arrow-right me-1 nav-icon"></i>
                    <span className="nav-text">Logout</span>
                  </button>
                </li>
                {user && (
                  <li className="nav-item user-profile">
                    <Link
                      to="/profile"
                      className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                    >
                      <img
                        src={user.photo || 'https://via.placeholder.com/150'}
                        alt={user.name}
                        className="rounded-circle profile-img"
                      />
                      <span className="profile-name">{user.name}</span>
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} 
                  to="/login"
                >
                  <i className="bi bi-person-circle me-1 nav-icon"></i>
                  <span className="nav-text">Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 