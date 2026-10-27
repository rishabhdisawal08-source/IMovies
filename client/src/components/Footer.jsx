import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer mt-auto">
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand d-flex align-items-center gap-2 mb-3">
              <span className="brand-badge">🎬</span>
              <span className="brand-text">i<span className="brand-accent">MOVIES</span></span>
            </div>
            <p className="text-secondary small pe-lg-4">
              Next-generation cinema ticketing platform powered by the MERN stack with atomic double-booking protection and live Socket.IO seat synchronization.
            </p>
            <div className="d-flex gap-2 tech-stack-tags mt-3">
              <span className="badge tech-badge">MongoDB</span>
              <span className="badge tech-badge">Express</span>
              <span className="badge tech-badge">React 18</span>
              <span className="badge tech-badge">Node.js</span>
              <span className="badge tech-badge">Socket.IO</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading mb-3">Navigation</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Browse Movies</Link></li>
              <li><Link to="/bookings">My Tickets</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading mb-3">System</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/admin">Admin Control</Link></li>
              <li><a href="http://localhost:5000/api/health" target="_blank" rel="noreferrer">API Health Status</a></li>
              <li><a href="#features">Platform Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="footer-heading mb-3">Safe & Instant</h6>
            <p className="text-secondary small mb-2">
              All bookings generate authenticated, instant digital boarding tickets with real-time seat lock verification.
            </p>
            <div className="safe-booking-indicator d-flex align-items-center gap-2 text-success small">
              <span className="live-indicator"></span>
              <span>Real-Time Seat Locks Active</span>
            </div>
          </div>
        </div>

        <hr className="footer-divider my-4" />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} IMovies Entertainment Inc. Built with full MERN stack.
          </div>
          <div className="d-flex gap-3">
            <span>Demo Mode &bull; Safe Test Environment</span>
            <span>Made with ❤️ for cinema enthusiasts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
