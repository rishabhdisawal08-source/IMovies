export default function TicketModal({ booking, onClose }) {
  if (!booking) return null;

  const show = booking.show || {};
  const movie = booking.movie || show.movie || {};
  const theatre = show.theatre || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-modal-backdrop" onClick={onClose}>
      <div className="ticket-modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="ticket-pass-card">
          {/* Header */}
          <div className="ticket-header d-flex justify-content-between align-items-center p-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4">🎬</span>
              <div>
                <h5 className="mb-0 fw-bold">iMOVIES PASS</h5>
                <small className="text-secondary">Official E-Ticket</small>
              </div>
            </div>
            <span className={`badge ticket-status-badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
              {booking.status ? booking.status.toUpperCase() : 'CONFIRMED'}
            </span>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body p-4">
            <div className="row g-3 align-items-center mb-3">
              {movie.posterUrl && (
                <div className="col-auto">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="ticket-poster-img rounded"
                  />
                </div>
              )}
              <div className="col">
                <span className="text-uppercase small text-purple fw-bold">Cinema Experience</span>
                <h3 className="ticket-movie-title fw-bold mb-1">{movie.title || 'Movie Title'}</h3>
                <p className="text-secondary small mb-0">
                  {movie.language || 'English'} &bull; {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'Action'}
                </p>
              </div>
            </div>

            <div className="ticket-info-grid my-3 p-3 rounded">
              <div className="row g-3">
                <div className="col-6">
                  <span className="ticket-info-label">THEATRE</span>
                  <div className="ticket-info-val fw-semibold">{theatre.name || 'Cinema Hall'}</div>
                  <small className="text-secondary">{theatre.location || 'City Center'}</small>
                </div>
                <div className="col-6">
                  <span className="ticket-info-label">SHOWTIME</span>
                  <div className="ticket-info-val fw-semibold">
                    {show.startsAt
                      ? new Date(show.startsAt).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Date TBA'}
                  </div>
                  <small className="text-secondary">
                    {show.startsAt
                      ? new Date(show.startsAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Time TBA'}
                  </small>
                </div>

                <div className="col-6">
                  <span className="ticket-info-label">SEATS ({booking.seatNumbers?.length || 0})</span>
                  <div className="d-flex gap-1 flex-wrap mt-1">
                    {booking.seatNumbers?.map(seat => (
                      <span key={seat} className="badge bg-purple-subtle text-purple-emphasis border border-purple-subtle">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-6">
                  <span className="ticket-info-label">TOTAL PAID</span>
                  <div className="ticket-info-val text-success fw-bold fs-5">
                    ₹{booking.totalAmount || 0}
                  </div>
                  <small className="text-secondary">All taxes included</small>
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div className="ticket-perforation my-4">
              <div className="notch notch-left"></div>
              <div className="perforated-line"></div>
              <div className="notch notch-right"></div>
            </div>

            {/* Barcode / Booking Code section */}
            <div className="ticket-footer text-center">
              <div className="ticket-code-label text-secondary small">BOOKING CODE</div>
              <div className="ticket-code-value font-monospace fw-bold fs-4 text-purple letter-spacing-2">
                {booking.bookingCode}
              </div>
              <div className="simulated-barcode mx-auto my-2"></div>
              <p className="text-secondary small mb-0">
                Present this digital pass or QR at the cinema entrance kiosk for direct admission.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="ticket-actions p-3 d-flex gap-2 justify-content-end bg-dark-subtle border-top border-secondary-subtle">
            <button type="button" className="btn btn-outline-light" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={handlePrint}>
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
