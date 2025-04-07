import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import './Calendar.css';
import TimeSlots from './TimeSlots';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем все записи
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, "appointments"));
        const snapshot = await getDocs(q);
        setAppointments(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Генерация дней календаря
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Добавляем дни текущего месяца
    for (let i = today.getDate(); i <= daysInMonth; i++) {
      days.push(new Date(today.getFullYear(), today.getMonth(), i));
    }
    
    // Добавляем дни следующего месяца
    const nextMonthDays = 35 - days.length; // Для 5 недель
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(new Date(today.getFullYear(), today.getMonth() + 1, i));
    }
    
    return days.slice(0, 35); // Ограничиваем 5 неделями
  };

  // Проверка доступности даты
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dateApps = appointments.filter(app => app.date === dateStr);
    return dateApps.length < 6; // Максимум 6 записей в день
  };

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date.toISOString().split('T')[0]);
    } else {
      alert('На эту дату уже нет свободных слотов');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="calendar-wrapper">
      <h2>Выберите дату</h2>
      <div className="calendar-grid">
        {generateCalendarDays().map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isAvailable = isDateAvailable(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
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