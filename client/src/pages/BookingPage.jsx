import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import TicketModal from '../components/TicketModal';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function BookingPage() {
  const { showId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Fetch Show details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get(`/shows/${showId}`)
      .then(res => {
        if (!isMounted) return;
        setShow(res.data.show);
      })
      .catch(err => {
        if (!isMounted) return;
        toast.error(err.response?.data?.message || 'Could not load show information.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showId]);

  // 2. Real-time Socket.IO synchronization for live seat locks
  useEffect(() => {
    if (!showId) return;

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join-show', showId);
    });

    socket.on('seats-updated', payload => {
      if (payload.showId === showId && payload.seats) {
        setShow(prevShow => (prevShow ? { ...prevShow, seats: payload.seats } : prevShow));

        // If any currently selected seat was just booked by another user, unselect it with a warning
        setSelectedSeats(prevSelected => {
          const bookedSeatNumbers = payload.seats
            .filter(s => s.status === 'booked')
            .map(s => s.seatNumber);

          const conflictSeats = prevSelected.filter(seat => bookedSeatNumbers.includes(seat));
          if (conflictSeats.length > 0) {
            toast.warn(`Seat(s) ${conflictSeats.join(', ')} were just reserved by another guest.`);
            return prevSelected.filter(seat => !bookedSeatNumbers.includes(seat));
          }
          return prevSelected;
        });
      }
    });

    return () => {
      socket.emit('leave-show', showId);
      socket.disconnect();
    };
  }, [showId]);

  // Handle seat click toggle
  const handleToggleSeat = seatNumber => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      if (prev.length >= 10) {
        toast.info('Maximum 10 seats allowed per transaction.');
        return prev;
      }
      return [...prev, seatNumber];
    });
  };

  // Price calculations
  const priceBreakdown = useMemo(() => {
    const seatPrice = show?.price || 0;
    const ticketCount = selectedSeats.length;
    const subtotal = seatPrice * ticketCount;
    const convenienceFee = ticketCount > 0 ? 30 : 0;
    const total = subtotal + convenienceFee;
    return { subtotal, convenienceFee, total, ticketCount };
  }, [show, selectedSeats]);

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!user) {
      toast.info('Please sign in to confirm your seats.');
      navigate('/login');
      return;
    }

    if (!selectedSeats.length) {
      toast.warn('Please select at least one seat to proceed.');
      return;
    }

    setBookingInProgress(true);
    try {
      const { data } = await api.post('/bookings', {
        showId,
        seatNumbers: selectedSeats
      });

      toast.success(data.message || 'Booking successful!');
      setConfirmedBooking(data.booking);
      setSelectedSeats([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking could not be completed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <main className="container page-container py-5 text-center">
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Loading auditorium layout...</span>
        </div>
        <p className="text-secondary mt-3">Connecting to real-time seat matrix...</p>
      </main>
    );
  }

  if (!show) {
    return (
      <main className="container page-container py-5 text-center">
        <h2>Show not available</h2>
        <p className="text-secondary">This showtime has ended or is no longer available.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Explore Other Shows
        </Link>
      </main>
    );
  }

  const movie = show.movie || {};
  const theatre = show.theatre || {};
  const showDate = new Date(show.startsAt).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const showTime = new Date(show.startsAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className="container page-container">
      {/* Top Navigation & Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span>&larr;</span>
          <span>Back</span>
        </button>

        <div className="d-flex align-items-center gap-2">
          <span className="live-indicator"></span>
          <span className="text-secondary small">Live Seat Sync Connected</span>
        </div>
      </div>

      {/* Show Header Card */}
      <div className="booking-header-card p-4 rounded-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-8">
            <span className="eyebrow">STEP 1: SELECT YOUR SEATS</span>
            <h2 className="mb-1 fw-bold">{movie.title || 'Movie Title'}</h2>
            <div className="text-secondary small d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-semibold text-light">{theatre.name}</span>
              <span>&bull;</span>
              <span>{theatre.location}</span>
              <span>&bull;</span>
              <span>{showDate} at {showTime}</span>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <span className="text-secondary small d-block">Ticket Price</span>
            <span className="fs-3 fw-bold text-purple">₹{show.price}</span>
            <span className="text-secondary small"> / seat</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Seat Map */}
        <div className="col-lg-8">
          <div className="seatmap-card p-4 rounded-4">
            <SeatMap
              seats={show.seats || []}
              selected={selectedSeats}
              onToggleSeat={handleToggleSeat}
              maxSeats={10}
            />
          </div>
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="col-lg-4">
          <div className="booking-summary-sidebar p-4 rounded-4 sticky-top">
            <h4 className="fw-bold mb-3">Order Summary</h4>

            <div className="summary-movie-info pb-3 mb-3 border-bottom border-secondary-subtle">
              <div className="fw-bold">{movie.title}</div>
              <small className="text-secondary d-block">{theatre.name}</small>
              <small className="text-purple-light">{showDate} &bull; {showTime}</small>
            </div>

            <div className="selected-seats-box mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-secondary fw-semibold">Seats Selected:</span>
                <span className="badge bg-purple">{selectedSeats.length} / 10</span>
              </div>
              {selectedSeats.length > 0 ? (
                <div className="d-flex flex-wrap gap-1">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="badge bg-purple-subtle text-light border border-purple-subtle">
                      {seat}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-secondary small italic">No seats picked yet. Click on the seats to select.</div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="cost-breakdown py-3 my-3 border-top border-bottom border-secondary-subtle">
              <div className="d-flex justify-content-between small text-secondary mb-2">
                <span>Tickets ({priceBreakdown.ticketCount} &times; ₹{show.price})</span>
                <span>₹{priceBreakdown.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between small text-secondary mb-2">
                <span>Convenience & Booking Fee</span>
                <span>₹{priceBreakdown.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 text-light mt-3 pt-2 border-top border-secondary-subtle">
                <span>Total Amount</span>
                <span className="text-purple">₹{priceBreakdown.total}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
              disabled={selectedSeats.length === 0 || bookingInProgress}
              onClick={handleConfirmBooking}
            >
              {bookingInProgress ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Reserving Seats...
                </>
              ) : (
                `Confirm & Book (${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'})`
              )}
            </button>

            <div className="text-center text-secondary small mt-3">
              <span>💳 Demo Mode: No real payment required. Your ticket is confirmed instantaneously.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal popup after booking */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/bookings');
          }}
        />
      )}
    </main>
  );
}
