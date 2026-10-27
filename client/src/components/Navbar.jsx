import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have logged out successfully.');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark topbar sticky-top">
      <div className="container">
        <Link className="navbar-brand brand d-flex align-items-center gap-2" to="/">
          <span className="brand-badge">🎬</span>
          <span>i<span className="brand-accent">MOVIES</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Movies
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink
                  to="/bookings"
                  className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tickets
                </NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link admin-nav-link ${isActive ? 'active-link' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Studio <span className="badge bg-purple ms-1">PRO</span>
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="user-profile-pill d-flex align-items-center gap-2">
                  <div className="avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-meta d-none d-sm-block">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role-tag">{user.role}</span>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger btn-logout"
                  onClick={handleLogout}
                  title="Log out of your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm btn-outline-light px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-primary px-3 shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
