import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="container page-container text-center py-5">
      <div className="empty-state-card p-5 rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="fs-1 mb-2">🎬</div>
        <h1 className="fw-bold display-4 text-purple">404</h1>
        <h3 className="fw-bold mb-3">Scene Not Found</h3>
        <p className="text-secondary mb-4">
          The scene or page you are looking for has been cut from the final reel, or the showtime has moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          &larr; Return to Box Office
        </Link>
      </div>
    </main>
  );
}
