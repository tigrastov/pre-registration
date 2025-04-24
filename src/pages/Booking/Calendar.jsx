import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Calendar.css';

export default function Calendar({ onDateSelect }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionDate: new Date(`${doc.data().date}T${doc.data().time}`)
      }));
      
      setAppointments(apps.sort((a, b) => a.sessionDate - b.sessionDate));
      
      if (auth.currentUser) {
        setUserBooking(apps.find(app => app.userId === auth.currentUser.uid) || null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateCalendarGrid = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); 
    const grid = [];
    for (let i = 0; i < 42; i++) { 
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      grid.push(date);
    }
    
    return grid;
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    
    const dateStr = formatLocalDate(date);
    if (appointments.filter(app => app.date === dateStr).length >= 4) return;
    
    setSelectedDate(dateStr);
    onDateSelect?.(dateStr);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="calendar-wrapper">
      {auth.currentUser && userBooking && (
        <div className="user-booking-info">
          <h3>Ваша текущая запись:</h3>
          <p>
            <strong>Дата:</strong> {formatDateDisplay(userBooking.date)}
            <br />
            <strong>Время:</strong> {userBooking.time}
            <br />
            {userBooking.status && (
              <span><strong>Статус:</strong> {userBooking.status === 'confirmed' ? 'Подтверждена' : 'Ожидает подтверждения'}</span>
            )}
          </p>
        </div>
      )}

      <h2>Выберите дату</h2>
      
      <div className="calendar-header">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
          <div 
            key={day} 
            className={`day-name-header ${index === new Date().getDay() - 1 ? 'current-day' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {generateCalendarGrid().map((date, index) => {
          const dateStr = formatLocalDate(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={`calendar-day 
                ${isPast ? 'past-day' : ''}
                ${isToday ? 'today' : ''}
                ${appointments.filter(app => app.date === dateStr).length >= 4 ? 'unavailable' : 'available'} 
                ${dateStr === selectedDate ? 'selected' : ''}
                ${userBooking?.date === dateStr ? 'user-booked' : ''}`}
              onClick={() => !isPast && handleDateClick(date)}
            >
              {date.getDate()}
              {isToday && <span className="today-marker">Сегодня</span>}
              {appointments.filter(app => app.date === dateStr).length >= 4 && (
                <span className="full-label">Нет мест</span>
              )}
              {userBooking?.date === dateStr && (
                <span className="user-booking-marker">Ваша запись</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Вспомогательные функции
function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function formatDateDisplay(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${parseInt(day)} ${months[parseInt(month)-1]} ${year}`;
}