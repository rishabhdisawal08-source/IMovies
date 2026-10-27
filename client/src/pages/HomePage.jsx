import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import MovieCard from '../components/MovieCard';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Adventure',
  'Thriller',
  'Animation',
  'Biography',
  'Comedy'
];

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/movies');
      setMovies(data.movies || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load movies from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter movies in memory for instant reactivity
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch =
        !search.trim() ||
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.description?.toLowerCase().includes(search.toLowerCase());

      const matchesGenre =
        selectedGenre === 'All' ||
        (Array.isArray(movie.genre) &&
          movie.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

      const matchesLanguage =
        selectedLanguage === 'All' ||
        movie.language?.toLowerCase() === selectedLanguage.toLowerCase();

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, search, selectedGenre, selectedLanguage]);

  return (
    <main className="container page-container">
      {/* Hero Section */}
      <section className="hero-banner mb-5">
        <div className="hero-content">
          <div className="eyebrow mb-2">NOW SCREENING IN THEATRES</div>
          <h1 className="hero-title mb-3">
            Big Stories.<br />
            <em className="text-gradient">Better Seats.</em>
          </h1>
          <p className="hero-subtitle mb-4">
            Discover the latest blockbusters, select your favorite luxury recliner seats in real-time,
            and enjoy hassle-free cinema ticketing.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <a href="#explore-movies" className="btn btn-primary btn-lg px-4 shadow">
              Browse Movies <span>&darr;</span>
            </a>
            <a href="#how-it-works" className="btn btn-outline-light btn-lg px-4">
              Explore Tech Stack <span>&rarr;</span>
            </a>
          </div>
        </div>

        <div className="hero-visual d-none d-lg-block">
          <div className="hero-orbit orbit-large"></div>
          <div className="hero-orbit orbit-small"></div>
          <div className="hero-floating-card">
            <span className="live-dot"></span>
            <div>
              <strong>Live Seat Sync</strong>
              <small className="d-block text-secondary">Zero Double Booking</small>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section id="how-it-works" className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="feature-card p-4 h-100 rounded-3">
            <div className="feature-icon mb-3">🔒</div>
            <h5 className="fw-bold mb-2">Atomic Seat Locking</h5>
            <p className="text-secondary small mb-0">
              Database-level conditional atomic updates guarantee two users can never reserve the exact same seat.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100 rounded-3">
            <div className="feature-icon mb-3">⚡</div>
            <h5 className="fw-bold mb-2">Real-Time Socket.IO</h5>
            <p className="text-secondary small mb-0">
              Instant live visual updates on the auditorium seat map when seats are selected or booked by anyone.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="feature-card p-4 h-100 rounded-3">
            <div className="feature-icon mb-3">🎟️</div>
            <h5 className="fw-bold mb-2">Digital Pass & QR</h5>
            <p className="text-secondary small mb-0">
              Get an instant boarding pass with verifiable booking code, seat breakdown, and print-ready format.
            </p>
          </div>
        </div>
      </section>

      {/* Movies Section */}
      <section id="explore-movies" className="movies-catalog-section mb-5">
        <div className="section-header d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <div className="eyebrow">CURATED SELECTION</div>
            <h2 className="section-title mb-0">
              Now <em className="text-gradient">Playing</em>
            </h2>
          </div>

          {/* Search Bar */}
          <div className="search-filter-box d-flex gap-2 flex-grow-1 flex-sm-grow-0">
            <div className="input-group">
              <span className="input-group-text bg-dark-subtle border-secondary-subtle text-secondary">
                🔍
              </span>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="Search movies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filters-wrapper d-flex flex-wrap gap-2 align-items-center mb-4">
          <span className="filter-label text-secondary small fw-bold me-2">Genre:</span>
          {GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              className={`btn btn-sm filter-pill ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="filter-label text-secondary small fw-bold">Language:</span>
            <select
              className="form-select form-select-sm language-dropdown"
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-purple" role="status">
              <span className="visually-hidden">Loading movies...</span>
            </div>
            <p className="text-secondary mt-3">Loading cinema schedule...</p>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {filteredMovies.map(movie => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card text-center p-5 rounded-3">
            <div className="empty-state-icon fs-1 mb-3">🎬</div>
            <h4 className="fw-bold mb-2">No movies match your search</h4>
            <p className="text-secondary mb-4">
              Try adjusting your genre or search term to discover available titles.
            </p>
            <button
              className="btn btn-outline-light"
              onClick={() => {
                setSearch('');
                setSelectedGenre('All');
                setSelectedLanguage('All');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
