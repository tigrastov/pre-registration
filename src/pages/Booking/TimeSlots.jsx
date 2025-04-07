import './TimeSlots.css';

export default function TimeSlots({ date }) {
  // Заглушка данных (заменим на запрос к Firebase)
  const slots = [
    { time: '10:00 - 11:00', isBooked: false },
    { time: '11:00 - 12:00', isBooked: true },
    { time: '12:00 - 13:00', isBooked: false }
  ];

  return (
    <div className="timeslots-wrapper">
      <h3>Доступные слоты на {date}</h3>
      <div className="timeslots-grid">
        {slots.map((slot, index) => (
          <button
            key={index}
            className={`timeslot ${slot.isBooked ? 'booked' : ''}`}
            disabled={slot.isBooked}
          >
            {slot.time}
            {slot.isBooked && <span> (Занято)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}