import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get(`/movies/${id}`),
      api.get('/shows', { params: { movieId: id } })
    ])
      .then(([movieRes, showsRes]) => {
        if (!isMounted) return;
        setMovie(movieRes.data.movie);
        const fetchedShows = showsRes.data.shows || [];
        setShows(fetchedShows);

        // Pre-select first available date if shows exist
        if (fetchedShows.length > 0) {
          const firstDateStr = new Date(fetchedShows[0].startsAt).toISOString().split('T')[0];
          setSelectedDate(firstDateStr);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        toast.error(err.response?.data?.message || 'Could not load movie details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Extract unique show dates
  const availableDates = useMemo(() => {
    const datesSet = new Set();
    shows.forEach(show => {
      const dateStr = new Date(show.startsAt).toISOString().split('T')[0];
      datesSet.add(dateStr);
    });
    return Array.from(datesSet).sort();
  }, [shows]);

  // Group shows for the selected date by Theatre
  const showsByTheatre = useMemo(() => {
    const map = new Map();
    const targetDate = selectedDate || (availableDates[0] || '');

    shows.forEach(show => {
      const dateStr = new Date(show.startsAt).toISOString().split('T')[0];
      if (dateStr === targetDate) {
        const theatreId = show.theatre?._id || 'unknown';
        if (!map.has(theatreId)) {
          map.set(theatreId, {
            theatre: show.theatre,
            shows: []
          });
        }
        map.get(theatreId).shows.push(show);
      }
    });

    return Array.from(map.values());
  }, [shows, selectedDate, availableDates]);

  if (loading) {
    return (
      <main className="container page-container py-5 text-center">
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Loading movie...</span>
        </div>
        <p className="text-secondary mt-3">Fetching movie details and schedule...</p>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="container page-container py-5 text-center">
        <h2>Movie not found</h2>
        <p className="text-secondary">The requested movie could not be found or has been deactivated.</p>
        <Link to="/" className="btn btn-primary mt-3">
          &larr; Back to Movies
        </Link>
      </main>
    );
  }

  return (
    <main className="container page-container">
      {/* Back Button */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span>&larr;</span>
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Movie Hero Showcase */}
      <section className="movie-detail-hero p-4 p-lg-5 rounded-4 mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-md-4 col-lg-3 text-center">
            <div className="detail-poster-wrapper shadow-lg rounded-3 overflow-hidden">
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
                alt={movie.title}
                className="img-fluid w-100 detail-poster-img"
              />
            </div>
          </div>

          <div className="col-md-8 col-lg-9">
            <div className="eyebrow mb-2">NOW SHOWING IN CINEMAS</div>
            <h1 className="movie-hero-title mb-2">{movie.title}</h1>

            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary mb-3">
              <span className="badge bg-warning text-dark fw-bold fs-6">
                ★ {movie.rating ? movie.rating.toFixed(1) : 'New'} / 10
              </span>
              <span>&bull;</span>
              <span>{movie.durationMinutes || 120} Minutes</span>
              <span>&bull;</span>
              <span>{movie.language || 'English'}</span>
              <span>&bull;</span>
              <span className="text-purple-light">
                {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'Action'}
              </span>
            </div>

            <p className="movie-description text-secondary-emphasis lead fs-6 mb-4">
              {movie.description}
            </p>

            <div className="movie-quick-tags d-flex gap-2 flex-wrap">
              <span className="badge bg-dark-subtle border border-secondary-subtle">4K Laser Projection</span>
              <span className="badge bg-dark-subtle border border-secondary-subtle">Dolby Atmos Sound</span>
              <span className="badge bg-dark-subtle border border-secondary-subtle">Recliner Seating Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes Selection Section */}
      <section className="showtimes-section mb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <div className="eyebrow">SELECT YOUR TIMING</div>
            <h2 className="section-title mb-0">Auditorium Showtimes</h2>
          </div>
        </div>

        {/* Date Filter Tabs */}
        {availableDates.length > 0 ? (
          <>
            <div className="date-tabs-bar d-flex gap-2 pb-2 mb-4 overflow-auto">
              {availableDates.map(dateStr => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const isSelected = (selectedDate || availableDates[0]) === dateStr;
                const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
                const dayNum = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });

                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={`btn date-pill-button text-center ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="small fw-bold">{dayName}</div>
                    <div className="date-day-num">{dayNum}</div>
                  </button>
                );
              })}
            </div>

            {/* Theatres and Show Slots */}
            {showsByTheatre.length > 0 ? (
              <div className="theatres-list d-flex flex-column gap-3">
                {showsByTheatre.map(({ theatre, shows: theatreShows }) => (
                  <div key={theatre?._id || Math.random()} className="theatre-show-card p-4 rounded-3">
                    <div className="theatre-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="mb-0 fw-bold">{theatre?.name || 'Grand Cinema'}</h5>
                        <small className="text-secondary">{theatre?.location || 'Central Plaza'}</small>
                      </div>
                      <span className="badge bg-secondary-subtle text-light small">
                        {theatre?.screens || 1} Screen Auditorium
                      </span>
                    </div>

                    <div className="show-slots-grid d-flex flex-wrap gap-3">
                      {theatreShows.map(s => {
                        const showTime = new Date(s.startsAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <button
                            key={s._id}
                            type="button"
                            className="btn btn-outline-purple show-slot-pill text-start p-3"
                            onClick={() => navigate(`/book/${s._id}`)}
                          >
                            <div className="slot-time fw-bold fs-5">{showTime}</div>
                            <div className="slot-price small text-secondary mt-1">
                              ₹{s.price} &bull; Standard / VIP
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card text-center p-4 rounded-3">
                <p className="text-secondary mb-0">No showtimes found for the selected date.</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state-card text-center p-5 rounded-3">
            <div className="fs-1 mb-2">🎟️</div>
            <h4 className="fw-bold mb-2">No upcoming shows scheduled yet</h4>
            <p className="text-secondary mb-3">
              Shows for this movie will be added shortly, or you can schedule shows from the Admin Studio.
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Other Movies
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
