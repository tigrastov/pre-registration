import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Calendar.css';

const formatDateDisplay = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${parseInt(day)} ${months[parseInt(month)-1]} ${year}`;
};

export default function Calendar({ onDateSelect }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userBooking, setUserBooking] = useState(null);

  // Загрузка записей для всех пользователей
  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionDate: new Date(`${doc.data().date}T${doc.data().time}`)
      }));
      
      const sortedBookings = apps.sort((a, b) => 
        a.sessionDate - b.sessionDate
      );
      
      setAppointments(sortedBookings);
      
      // Проверяем запись текущего пользователя (если авторизован)
      if (auth.currentUser) {
        const userApp = apps.find(app => 
          app.userId === auth.currentUser.uid
        );
        setUserBooking(userApp || null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleDateClick = (date) => {
    const dateStr = formatLocalDate(date);
    const appsForDate = appointments.filter(app => app.date === dateStr);
    
    if (appsForDate.length >= 4) return;
    
    setSelectedDate(dateStr);
    onDateSelect && onDateSelect(dateStr);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="calendar-wrapper">
      {/* Показываем информацию о записи только для авторизованных */}
      {auth.currentUser && userBooking && (
        <div className="user-booking-info">
          <h3>Ваша текущая запись:</h3>
          <p>
            <strong>Дата:</strong> {formatDateDisplay(userBooking.date)}
            <br />
            <strong>Время:</strong> {userBooking.time}
            <br />
            {userBooking.status && (
              <><strong>Статус:</strong> {userBooking.status === 'confirmed' ? 'Подтверждена' : 'Ожидает подтверждения'}</>
            )}
          </p>
        </div>
      )}

      <h2>Выберите дату</h2>
      
      <div className="calendar-grid">
        {generateCalendarDays().map((date, index) => {
          const dateStr = formatLocalDate(date);
          const isToday = dateStr === formatLocalDate(new Date());
          const isFull = appointments.filter(app => app.date === dateStr).length >= 4;
          const isUserBooked = auth.currentUser && userBooking && userBooking.date === dateStr;
          
          return (
            <div
              key={index}
              className={`calendar-day 
                ${isFull ? 'unavailable' : 'available'} 
                ${dateStr === selectedDate ? 'selected' : ''}
                ${isToday ? 'today' : ''}
                ${isUserBooked ? 'user-booked' : ''}`}
              onClick={() => !isFull && handleDateClick(date)}
            >
              {date.getDate()}
              {isToday && <span className="today-marker">Сегодня</span>}
              {isFull && <span className="full-label">Нет мест</span>}
              {isUserBooked && <span className="user-booking-marker">Ваша запись</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};