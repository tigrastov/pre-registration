import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './Calendar.css';
import TimeSlots from './TimeSlots';

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Calendar({ onDateSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(apps);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDateClick = (date) => {
    const dateStr = formatLocalDate(date);
    const isAvailable = appointments.filter(app => app.date === dateStr).length < 6;
    if (isAvailable) {
      setSelectedDate(dateStr);
      onDateSelect(dateStr);
    }
  };

  const generateCalendarDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let i = today.getDate(); i <= daysInMonth; i++) {
      days.push(new Date(today.getFullYear(), today.getMonth(), i));
    }
    
    const nextMonthDays = 35 - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(new Date(today.getFullYear(), today.getMonth() + 1, i));
    }
    
    return days.slice(0, 35);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="calendar-wrapper">
      <h2>Выберите дату</h2>
      <div className="calendar-grid">
        {generateCalendarDays().map((date, index) => {
          const dateStr = formatLocalDate(date);
          const isToday = formatLocalDate(date) === formatLocalDate(new Date());
          const isAvailable = appointments.filter(app => app.date === dateStr).length < 6;
          
          return (
            <div
              key={index}
              className={`calendar-day 
                ${isAvailable ? 'available' : 'unavailable'} 
                ${dateStr === selectedDate ? 'selected' : ''}
                ${isToday ? 'today' : ''}`}
              onClick={() => isAvailable && handleDateClick(date)}
            >
              {date.getDate()}
              {isToday && <span className="today-marker">Сегодня</span>}
            </div>
          );
        })}
      </div>
      
      {selectedDate && (
        <TimeSlots 
          date={selectedDate}
          appointments={appointments.filter(app => app.date === selectedDate)}
        />
      )}
    </div>
  );
}