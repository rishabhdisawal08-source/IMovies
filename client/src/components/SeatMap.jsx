import { useMemo } from 'react';

export default function SeatMap({ seats = [], selected = [], onToggleSeat, maxSeats = 10 }) {
  // Group seats by their row letter (e.g. 'A', 'B', 'C')
  const rows = useMemo(() => {
    const rowMap = new Map();
    for (const seat of seats) {
      const match = seat.seatNumber.match(/^([A-Za-z]+)(\d+)$/);
      const rowKey = match ? match[1] : seat.seatNumber.charAt(0);
      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, []);
      }
      rowMap.get(rowKey).push(seat);
    }
    // Sort seats in each row by column number
    for (const [, seatList] of rowMap) {
      seatList.sort((a, b) => {
        const numA = parseInt(a.seatNumber.replace(/^\D+/, ''), 10) || 0;
        const numB = parseInt(b.seatNumber.replace(/^\D+/, ''), 10) || 0;
        return numA - numB;
      });
    }
    return Array.from(rowMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seats]);

  return (
    <div className="seat-selection-container">
      {/* Cinema Screen Visual */}
      <div className="screen-container text-center my-4">
        <div className="curved-screen"></div>
        <div className="screen-label mt-2">
          <span>🎬 AUDITORIUM SCREEN 🎬</span>
        </div>
      </div>

      {/* Seat Legend */}
      <div className="seat-legend d-flex justify-content-center gap-4 flex-wrap my-3">
        <div className="legend-item d-flex align-items-center gap-2">
          <span className="legend-box available-box"></span>
          <span className="small text-secondary">Available</span>
        </div>
        <div className="legend-item d-flex align-items-center gap-2">
          <span className="legend-box selected-box"></span>
          <span className="small text-secondary">Selected ({selected.length})</span>
        </div>
        <div className="legend-item d-flex align-items-center gap-2">
          <span className="legend-box booked-box"></span>
          <span className="small text-secondary">Reserved / Booked</span>
        </div>
      </div>

      {/* Seat Layout Grid */}
      <div className="seat-grid-wrapper my-4">
        {rows.map(([rowLetter, rowSeats]) => (
          <div key={rowLetter} className="seat-row-wrapper d-flex align-items-center justify-content-center gap-2 my-2">
            <span className="row-label me-2 fw-bold text-secondary">{rowLetter}</span>

            <div className="d-flex gap-2 flex-wrap justify-content-center">
              {rowSeats.map(seat => {
                const isSelected = selected.includes(seat.seatNumber);
                const isBooked = seat.status === 'booked';

                return (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    disabled={isBooked}
                    title={`${seat.seatNumber} - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                    className={`seat-button ${seat.status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => onToggleSeat(seat.seatNumber)}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>

            <span className="row-label ms-2 fw-bold text-secondary">{rowLetter}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-secondary small">
        <span>You can select up to {maxSeats} tickets per booking. Click any available seat to select/deselect.</span>
      </div>
    </div>
  );
}
