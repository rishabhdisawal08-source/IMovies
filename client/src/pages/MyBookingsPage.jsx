import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import TicketModal from '../components/TicketModal';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async bookingId => {
    if (!window.confirm('Are you sure you want to cancel this booking? The reserved seats will be made available for others.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success(data.message || 'Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="container page-container">
      <div className="section-header mb-4">
        <div className="eyebrow">YOUR TICKET WALLET</div>
        <h1 className="page-title mb-1">
          My <em className="text-gradient">Bookings</em>
        </h1>
        <p className="text-secondary small">
          View your confirmed cinema passes, download digital tickets, or manage reservations.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-purple" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
          <p className="text-secondary mt-3">Fetching your ticket history...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="row g-4">
          {bookings.map(booking => {
            const show = booking.show || {};
            const movie = booking.movie || show.movie || {};
            const theatre = show.theatre || {};
            const isConfirmed = booking.status === 'confirmed';
            const isUpcoming = show.startsAt && new Date(show.startsAt) > new Date();

            return (
              <div key={booking._id} className="col-12">
                <div className="booking-card p-4 rounded-4">
                  <div className="row g-4 align-items-center">
                    {/* Poster / Cinema Badge */}
                    <div className="col-auto">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="booking-poster-img rounded-3"
                        />
                      ) : (
                        <div className="booking-avatar-badge rounded-3 d-flex align-items-center justify-content-center">
                          🎬
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="col">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`badge ${
                            isConfirmed ? 'bg-success' : 'bg-danger'
                          } text-uppercase letter-spacing-1`}
                        >
                          {booking.status}
                        </span>
                        <span className="booking-code-pill font-monospace small">
                          {booking.bookingCode}
                        </span>
                        {isUpcoming ? (
                          <span className="badge bg-purple-subtle text-light small">Upcoming</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary small">Past Show</span>
                        )}
                      </div>

                      <h4 className="fw-bold mb-1">{movie.title || 'Movie Title'}</h4>
                      <p className="text-secondary small mb-2">
                        <strong className="text-light">{theatre.name || 'Cinema'}</strong>
                        {theatre.location && ` &bull; ${theatre.location}`}
                      </p>

                      <div className="d-flex flex-wrap gap-3 small text-secondary">
                        <div>
                          <span>Showtime: </span>
                          <strong className="text-light">
                            {show.startsAt
                              ? new Date(show.startsAt).toLocaleString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Date not available'}
                          </strong>
                        </div>
                        <div>
                          <span>Seats: </span>
                          <strong className="text-purple-light">
                            {booking.seatNumbers?.join(', ') || 'N/A'}
                          </strong>
                        </div>
                        <div>
                          <span>Paid: </span>
                          <strong className="text-success">₹{booking.totalAmount}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-lg-auto d-flex flex-lg-column gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-sm px-3"
                        onClick={() => setActiveTicket(booking)}
                      >
                        View Digital Pass 🎟️
                      </button>

                      {isConfirmed && isUpcoming && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm px-3"
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-card text-center p-5 rounded-4">
          <div className="fs-1 mb-3">🎟️</div>
          <h4 className="fw-bold mb-2">No bookings yet</h4>
          <p className="text-secondary mb-4">
            Your ticket wallet is currently empty. Find your next movie night experience now!
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Browse Movies Now &rarr;
          </Link>
        </div>
      )}

      {/* Digital Ticket Modal */}
      {activeTicket && (
        <TicketModal booking={activeTicket} onClose={() => setActiveTicket(null)} />
      )}
    </main>
  );
}
