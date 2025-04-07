import { useState } from 'react';
import './Calendar.css';
import TimeSlots from './TimeSlots';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Заглушка данных (заменим на запрос к Firebase)
  const busyDates = ['2024-07-10', '2024-07-15']; // Пример занятых дат

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="calendar-wrapper">
      <h2>Выберите дату</h2>
      <div className="calendar-grid">
        {/* Рендер дней месяца */}
        {[...Array(31).keys()].map(day => {
          const date = `2024-07-${day + 1}`;
          const isBusy = busyDates.includes(date);
          return (
            <div 
              key={day}
              className={`calendar-day ${isBusy ? 'busy' : ''} ${date === selectedDate ? 'selected' : ''}`}
              onClick={() => !isBusy && handleDateClick(date)}
            >
              {day + 1}
            </div>
          );
        })}
      </div>
      
      {selectedDate && <TimeSlots date={selectedDate} />}
    </div>
  );
}