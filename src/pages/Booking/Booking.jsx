import './Booking.css';
import Calendar from './Calendar';

export default function Booking() {
  return (
    <main className="booking-page">
      <h1>Запись на сеанс</h1>
      <div className="booking-container">
        <Calendar />
      </div>
    </main>
  );
}