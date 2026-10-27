import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

function Guard({ children, admin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="container page-container text-center py-5">
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Authenticating session...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== 'admin') {
    return (
      <main className="container page-container text-center py-5">
        <div className="empty-state-card p-5 rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
          <div className="fs-1 mb-2">🚫</div>
          <h2 className="fw-bold mb-2">Admin Access Required</h2>
          <p className="text-secondary mb-4">
            You are signed in as <strong>{user.email}</strong>, but this page requires administrator privileges.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Movies
          </Link>
        </div>
      </main>
    );
  }

  return children;
}

export default function App() {
  return (
    <div className="app-layout d-flex flex-column min-vh-100">
      <Navbar />

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage isRegister />} />

          {/* Protected Routes */}
          <Route
            path="/book/:showId"
            element={
              <Guard>
                <BookingPage />
              </Guard>
            }
          />
          <Route
            path="/bookings"
            element={
              <Guard>
                <MyBookingsPage />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard admin>
                <AdminPage />
              </Guard>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />

      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
