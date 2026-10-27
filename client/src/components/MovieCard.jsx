import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <div className="movie-card d-flex flex-column h-100">
      <Link to={`/movie/${movie._id}`} className="poster-wrap">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
          />
        ) : (
          <div className="poster-placeholder">
            <span className="placeholder-icon">IM</span>
            <small>CINEMA</small>
          </div>
        )}
        <div className="poster-overlay">
          <span className="btn btn-sm btn-light fw-bold">View Showtimes</span>
        </div>
        <div className="card-top-badges">
          <span className="rating-badge">★ {movie.rating ? movie.rating.toFixed(1) : 'New'}</span>
          {movie.durationMinutes && (
            <span className="duration-badge">{movie.durationMinutes}m</span>
          )}
        </div>
      </Link>

      <div className="movie-info d-flex flex-column flex-grow-1 p-3">
        <h5 className="movie-title mb-1 text-truncate" title={movie.title}>
          <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
        </h5>

        <div className="movie-meta text-secondary small mb-2 d-flex align-items-center gap-1 flex-wrap">
          <span className="language-tag">{movie.language || 'Cinema'}</span>
          <span>&bull;</span>
          <span className="genres-text text-truncate">
            {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'Action'}
          </span>
        </div>

        <p className="movie-desc-short text-secondary small mb-3 flex-grow-1">
          {movie.description
            ? movie.description.length > 85
              ? `${movie.description.slice(0, 85)}...`
              : movie.description
            : 'Experience the magic on the big screen.'}
        </p>

        <Link
          to={`/movie/${movie._id}`}
          className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
        >
          <span>Book Tickets</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
