import './Booking.css';
import Calendar from './Calendar';
import { useState } from 'react';

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);

  // Функция для форматирования даты (10 апреля 2023)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${parseInt(day)} ${months[parseInt(month)-1]} ${year}`;
  };

  return (
    <main className="booking-page">
      <h1>
        Запись на сеанс
        {selectedDate && ` • ${formatDisplayDate(selectedDate)}`}
      </h1>
      <div className="booking-container">
        <Calendar 
          onDateSelect={(date) => setSelectedDate(date)} 
        />
      </div>
    </main>
  );
}