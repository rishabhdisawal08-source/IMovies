import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState({
    moviesCount: 0,
    theatresCount: 0,
    upcomingShowsCount: 0,
    totalUsersCount: 0,
    bookingsCount: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);

  // Forms
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    durationMinutes: 130,
    rating: 8.5
  });

  const [theatreForm, setTheatreForm] = useState({
    name: '',
    location: '',
    screens: 4
  });

  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    startsAt: '',
    price: 350,
    rows: 6,
    seatsPerRow: 10
  });

  const [actionBusy, setActionBusy] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, moviesRes, theatresRes, showsRes] = await Promise.all([
        api.get('/admin/metrics').catch(() => ({ data: { metrics: {}, recentBookings: [] } })),
        api.get('/movies'),
        api.get('/theatres'),
        api.get('/shows', { params: { all: 'true' } })
      ]);

      if (metricsRes.data.metrics) setMetrics(metricsRes.data.metrics);
      if (metricsRes.data.recentBookings) setRecentBookings(metricsRes.data.recentBookings);
      setMovies(moviesRes.data.movies || []);
      setTheatres(theatresRes.data.theatres || []);
      setShows(showsRes.data.shows || []);

      // Preset showForm selects if available
      if (moviesRes.data.movies?.length > 0 && !showForm.movieId) {
        setShowForm(prev => ({ ...prev, movieId: moviesRes.data.movies[0]._id }));
      }
      if (theatresRes.data.theatres?.length > 0 && !showForm.theatreId) {
        setShowForm(prev => ({ ...prev, theatreId: theatresRes.data.theatres[0]._id }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handlers
  const handleAddMovie = async e => {
    e.preventDefault();
    setActionBusy(true);
    try {
      const genresArray = movieForm.genre
        .split(',')
        .map(g => g.trim())
        .filter(Boolean);

      await api.post('/movies', {
        ...movieForm,
        genre: genresArray,
        durationMinutes: Number(movieForm.durationMinutes),
        rating: Number(movieForm.rating)
      });

      toast.success(`Movie "${movieForm.title}" listed successfully!`);
      setMovieForm({
        title: '',
        description: '',
        posterUrl: '',
        genre: 'Action, Drama',
        language: 'English',
        durationMinutes: 120,
        rating: 8.0
      });
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add movie.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteMovie = async movieId => {
    if (!window.confirm('Deactivate this movie? Shows currently active may be affected.')) return;
    try {
      await api.delete(`/movies/${movieId}`);
      toast.success('Movie deactivated.');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not deactivate movie.');
    }
  };

  const handleAddTheatre = async e => {
    e.preventDefault();
    setActionBusy(true);
    try {
      await api.post('/theatres', {
        ...theatreForm,
        screens: Number(theatreForm.screens)
      });
      toast.success(`Theatre "${theatreForm.name}" created!`);
      setTheatreForm({ name: '', location: '', screens: 4 });
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create theatre.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteTheatre = async theatreId => {
    if (!window.confirm('Delete this theatre listing?')) return;
    try {
      await api.delete(`/theatres/${theatreId}`);
      toast.success('Theatre removed.');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete theatre.');
    }
  };

  const handleScheduleShow = async e => {
    e.preventDefault();
    if (!showForm.startsAt) {
      toast.warn('Please select show date and time.');
      return;
    }

    setActionBusy(true);
    try {
      await api.post('/shows', {
        movie: showForm.movieId,
        theatre: showForm.theatreId,
        startsAt: new Date(showForm.startsAt),
        price: Number(showForm.price),
        rows: Number(showForm.rows),
        seatsPerRow: Number(showForm.seatsPerRow)
      });

      toast.success('Auditorium show scheduled and seats initialized!');
      setShowForm(prev => ({ ...prev, startsAt: '' }));
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule show.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteShow = async showId => {
    if (!window.confirm('Deactivate this scheduled show?')) return;
    try {
      await api.delete(`/shows/${showId}`);
      toast.success('Show deactivated.');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not deactivate show.');
    }
  };

  return (
    <main className="container page-container">
      {/* Header */}
      <div className="section-header mb-4">
        <div className="eyebrow">ADMINISTRATION CONTROL PANEL</div>
        <h1 className="page-title mb-1">
          Cinema <em className="text-gradient">Studio</em>
        </h1>
        <p className="text-secondary small">
          Full management of movies, theatres, upcoming shows, and platform ticketing metrics.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="admin-tabs d-flex gap-2 border-bottom border-secondary-subtle pb-2 mb-4 overflow-auto">
        <button
          type="button"
          className={`btn btn-sm admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          type="button"
          className={`btn btn-sm admin-tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          🎬 Movies ({movies.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm admin-tab-btn ${activeTab === 'theatres' ? 'active' : ''}`}
          onClick={() => setActiveTab('theatres')}
        >
          🏢 Theatres ({theatres.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm admin-tab-btn ${activeTab === 'shows' ? 'active' : ''}`}
          onClick={() => setActiveTab('shows')}
        >
          🎟️ Shows & Scheduling ({shows.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-purple" role="status">
            <span className="visually-hidden">Loading admin records...</span>
          </div>
          <p className="text-secondary mt-3">Connecting to cinema database...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Total Platform Revenue</span>
                    <h2 className="stat-value text-success fw-bold my-1">
                      ₹{metrics.totalRevenue?.toLocaleString() || 0}
                    </h2>
                    <span className="badge bg-success-subtle text-success small">Real-time Bookings</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Total Tickets Sold</span>
                    <h2 className="stat-value text-purple fw-bold my-1">
                      {metrics.bookingsCount || 0}
                    </h2>
                    <span className="badge bg-purple-subtle text-light small">Zero Collisions</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Active Scheduled Shows</span>
                    <h2 className="stat-value text-warning fw-bold my-1">
                      {metrics.upcomingShowsCount || 0}
                    </h2>
                    <span className="badge bg-warning-subtle text-warning small">Across All Theatres</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Curated Movies</span>
                    <h3 className="stat-value text-light fw-bold my-1">{metrics.moviesCount || 0}</h3>
                    <small className="text-secondary">Currently screening</small>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Auditorium Theatres</span>
                    <h3 className="stat-value text-light fw-bold my-1">{metrics.theatresCount || 0}</h3>
                    <small className="text-secondary">Multiplex partners</small>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="stat-card p-4 rounded-4">
                    <span className="stat-label text-secondary small">Registered Patrons</span>
                    <h3 className="stat-value text-light fw-bold my-1">{metrics.totalUsersCount || 0}</h3>
                    <small className="text-secondary">Cinema account holders</small>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Feed */}
              <div className="panel-card p-4 rounded-4">
                <h4 className="fw-bold mb-3">Recent Ticket Transactions</h4>
                {recentBookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0">
                      <thead>
                        <tr className="text-secondary small">
                          <th>Code</th>
                          <th>Guest</th>
                          <th>Movie</th>
                          <th>Theatre</th>
                          <th>Seats</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map(b => (
                          <tr key={b._id}>
                            <td className="font-monospace text-purple fw-bold">{b.bookingCode}</td>
                            <td>{b.user?.name || b.user?.email || 'Guest'}</td>
                            <td className="fw-semibold">{b.movie?.title || 'Movie'}</td>
                            <td className="small text-secondary">{b.show?.theatre?.name || 'Cinema'}</td>
                            <td>
                              <span className="badge bg-dark-subtle border border-secondary-subtle">
                                {b.seatNumbers?.join(', ')}
                              </span>
                            </td>
                            <td className="text-success fw-bold">₹{b.totalAmount}</td>
                            <td>
                              <span
                                className={`badge ${
                                  b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No bookings recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MOVIES */}
          {activeTab === 'movies' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Add New Movie</h4>
                  <form onSubmit={handleAddMovie} className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small text-secondary">Movie Title</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="e.g. Gladiator II"
                        required
                        value={movieForm.title}
                        onChange={e => setMovieForm({ ...movieForm, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Synopsis / Description</label>
                      <textarea
                        className="form-control custom-input"
                        rows="3"
                        placeholder="Short summary of the film..."
                        required
                        value={movieForm.description}
                        onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Poster URL (Web Image)</label>
                      <input
                        type="url"
                        className="form-control custom-input"
                        placeholder="https://..."
                        value={movieForm.posterUrl}
                        onChange={e => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small text-secondary">Language</label>
                        <input
                          type="text"
                          className="form-control custom-input"
                          placeholder="e.g. English"
                          value={movieForm.language}
                          onChange={e => setMovieForm({ ...movieForm, language: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-secondary">Duration (Mins)</label>
                        <input
                          type="number"
                          className="form-control custom-input"
                          min="1"
                          value={movieForm.durationMinutes}
                          onChange={e => setMovieForm({ ...movieForm, durationMinutes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-8">
                        <label className="form-label small text-secondary">Genres (comma separated)</label>
                        <input
                          type="text"
                          className="form-control custom-input"
                          placeholder="Action, Sci-Fi"
                          value={movieForm.genre}
                          onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })}
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small text-secondary">Rating (0-10)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          className="form-control custom-input"
                          value={movieForm.rating}
                          onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary fw-bold mt-2"
                      disabled={actionBusy}
                    >
                      {actionBusy ? 'Adding Movie...' : 'Add Movie to Catalog'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Active Movie Listings ({movies.length})</h4>
                  <div className="d-flex flex-column gap-3">
                    {movies.map(m => (
                      <div key={m._id} className="d-flex align-items-center gap-3 p-3 rounded-3 bg-dark-subtle border border-secondary-subtle">
                        {m.posterUrl ? (
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="rounded"
                            style={{ width: '48px', height: '64px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: '48px', height: '64px' }}
                          >
                            🎬
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <h6 className="mb-0 fw-bold">{m.title}</h6>
                          <small className="text-secondary d-block">
                            {m.language} &bull; {m.durationMinutes} min &bull; ★ {m.rating}
                          </small>
                          <small className="text-purple-light">
                            {Array.isArray(m.genre) ? m.genre.join(', ') : m.genre}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteMovie(m._id)}
                        >
                          Deactivate
                        </button>
                      </div>
                    ))}
                    {!movies.length && <p className="text-secondary">No movies listed.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEATRES */}
          {activeTab === 'theatres' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Add Theatre / Multiplex</h4>
                  <form onSubmit={handleAddTheatre} className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small text-secondary">Theatre Name</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="e.g. PVR ICON: Gold Class"
                        required
                        value={theatreForm.name}
                        onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label small text-secondary">City & Location</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="e.g. Bandra West, Mumbai"
                        required
                        value={theatreForm.location}
                        onChange={e => setTheatreForm({ ...theatreForm, location: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Screens Count</label>
                      <input
                        type="number"
                        className="form-control custom-input"
                        min="1"
                        max="20"
                        value={theatreForm.screens}
                        onChange={e => setTheatreForm({ ...theatreForm, screens: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary fw-bold mt-2"
                      disabled={actionBusy}
                    >
                      {actionBusy ? 'Creating Theatre...' : 'Register Theatre'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Registered Theatres ({theatres.length})</h4>
                  <div className="d-flex flex-column gap-3">
                    {theatres.map(th => (
                      <div key={th._id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-dark-subtle border border-secondary-subtle">
                        <div>
                          <h6 className="mb-0 fw-bold">{th.name}</h6>
                          <small className="text-secondary d-block">{th.location}</small>
                          <span className="badge bg-purple-subtle text-light small mt-1">
                            {th.screens} Auditorium Screen{th.screens > 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteTheatre(th._id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {!theatres.length && <p className="text-secondary">No theatres created yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHOWS & SCHEDULING */}
          {activeTab === 'shows' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Schedule an Auditorium Show</h4>
                  <form onSubmit={handleScheduleShow} className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small text-secondary">Select Movie</label>
                      <select
                        className="form-select custom-input"
                        required
                        value={showForm.movieId}
                        onChange={e => setShowForm({ ...showForm, movieId: e.target.value })}
                      >
                        <option value="">-- Choose Movie --</option>
                        {movies.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.title} ({m.language})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Select Theatre</label>
                      <select
                        className="form-select custom-input"
                        required
                        value={showForm.theatreId}
                        onChange={e => setShowForm({ ...showForm, theatreId: e.target.value })}
                      >
                        <option value="">-- Choose Theatre --</option>
                        {theatres.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.name} &bull; {t.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Show Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control custom-input"
                        required
                        value={showForm.startsAt}
                        onChange={e => setShowForm({ ...showForm, startsAt: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label small text-secondary">Base Ticket Price (₹)</label>
                      <input
                        type="number"
                        className="form-control custom-input"
                        min="50"
                        value={showForm.price}
                        onChange={e => setShowForm({ ...showForm, price: e.target.value })}
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small text-secondary">Seat Rows (A-L)</label>
                        <input
                          type="number"
                          className="form-control custom-input"
                          min="2"
                          max="12"
                          value={showForm.rows}
                          onChange={e => setShowForm({ ...showForm, rows: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-secondary">Seats per Row</label>
                        <input
                          type="number"
                          className="form-control custom-input"
                          min="4"
                          max="20"
                          value={showForm.seatsPerRow}
                          onChange={e => setShowForm({ ...showForm, seatsPerRow: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="small text-secondary">
                      Capacity: {Number(showForm.rows) * Number(showForm.seatsPerRow)} seats auto-generated
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary fw-bold mt-2"
                      disabled={actionBusy}
                    >
                      {actionBusy ? 'Initializing Seats...' : 'Publish Show'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="panel-card p-4 rounded-4">
                  <h4 className="fw-bold mb-3">Published Shows ({shows.length})</h4>
                  <div className="d-flex flex-column gap-3">
                    {shows.map(s => {
                      const showDate = new Date(s.startsAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const availableCount = s.seats?.filter(st => st.status === 'available').length || 0;
                      const totalSeats = s.seats?.length || 0;

                      return (
                        <div key={s._id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-dark-subtle border border-secondary-subtle flex-wrap gap-2">
                          <div>
                            <h6 className="mb-0 fw-bold">{s.movie?.title || 'Movie'}</h6>
                            <small className="text-secondary d-block">
                              {s.theatre?.name} &bull; {showDate}
                            </small>
                            <small className="text-purple-light">
                              Price: ₹{s.price} &bull; Seats: {availableCount} / {totalSeats} available
                            </small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteShow(s._id)}
                          >
                            Deactivate
                          </button>
                        </div>
                      );
                    })}
                    {!shows.length && <p className="text-secondary">No shows currently scheduled.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
