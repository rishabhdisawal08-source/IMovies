import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ isRegister = false }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [busy, setBusy] = useState(false);

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome to iMOVIES.');
      } else {
        await login(form.email, form.password);
        toast.success('Signed in successfully.');
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (email, password) => {
    setForm(prev => ({ ...prev, email, password }));
    toast.info(`Filled credentials for ${email}`);
  };

  return (
    <main className="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div className="auth-card-container p-4 p-sm-5 rounded-4 shadow-lg">
        {/* Brand Header */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 brand fs-2 mb-2">
            <span>🎬</span>
            <span>i<span className="brand-accent">MOVIES</span></span>
          </Link>
          <div className="eyebrow">{isRegister ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</div>
          <h2 className="fw-bold mt-1 mb-2">
            {isRegister ? 'Create an Account' : 'Sign in to iMOVIES'}
          </h2>
          <p className="text-secondary small mb-0">
            {isRegister
              ? 'Book tickets in seconds, access exclusive pre-sales, and save favorites.'
              : 'Sign in to access your digital passes and manage seat reservations.'}
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar (Only on login) */}
        {!isRegister && (
          <div className="demo-credentials-banner p-3 rounded-3 mb-4">
            <div className="small fw-bold text-secondary mb-2">⚡ Quick Fill Demo Accounts:</div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-purple flex-grow-1"
                onClick={() => fillCredentials('demo@imovies.com', 'Demo@123456')}
              >
                👤 Demo Guest
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning flex-grow-1"
                onClick={() => fillCredentials('admin@imovies.com', 'Admin@123456')}
              >
                👑 Admin Director
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {isRegister && (
            <div>
              <label className="form-label small text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="e.g. John Doe"
                required
                minLength="2"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="form-label small text-secondary">Email Address</label>
            <input
              type="email"
              className="form-control custom-input"
              placeholder="e.g. name@example.com"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label small text-secondary">Password</label>
            <input
              type="password"
              className="form-control custom-input"
              placeholder="At least 8 characters"
              required
              minLength="8"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 fw-bold mt-2 shadow"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : isRegister ? (
              'Create Account &rarr;'
            ) : (
              'Sign In &rarr;'
            )}
          </button>
        </form>

        {/* Switch Link */}
        <div className="text-center mt-4 pt-3 border-top border-secondary-subtle small text-secondary">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <Link to="/login" className="text-purple fw-bold">
                Sign In
              </Link>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <Link to="/register" className="text-purple fw-bold">
                Join Free
              </Link>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
