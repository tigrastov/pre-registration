import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './Calendar.css';
import TimeSlots from './TimeSlots';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [busyDates, setBusyDates] = useState([]);
  const [monthDays, setMonthDays] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Получаем все записи из Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "appointments"));
        const appointmentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAppointments(appointmentsData);
        const dates = appointmentsData.map(app => app.date);
        setBusyDates(dates);
      } catch (error) {
        console.error("Error fetching appointments: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Генерируем дни месяца
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentMonthDays = Array.from(
      { length: daysInCurrentMonth - today.getDate() + 1 }, 
      (_, i) => new Date(currentYear, currentMonth, today.getDate() + i)
    );
    
    const nextMonthDays = Array.from({ length: 31 }, (_, i) => 
      new Date(currentYear, currentMonth + 1, i + 1)
    ).filter(date => date.getMonth() === currentMonth + 1);
    
    setMonthDays([...currentMonthDays, ...nextMonthDays].slice(0, 31));
  }, []);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (!busyDates.includes(dateStr)) {
      setSelectedDate(dateStr);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="calendar-wrapper">
      <h2>Выберите дату</h2>
      <div className="calendar-grid">
        {monthDays.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isBusy = busyDates.includes(dateStr);
          const isToday = date.toDateString() === new Date().toDateString();
          const dateAppointments = appointments.filter(app => app.date === dateStr);
          
          return (
            <div 
              key={index}
              className={`calendar-day 
                ${isBusy ? 'busy' : ''} 
                ${dateStr === selectedDate ? 'selected' : ''}
                ${isToday ? 'today' : ''}`}
              onClick={() => !isBusy && handleDateClick(date)}
              title={isBusy ? `Записаны: ${dateAppointments.map(a => `${a.name} ${a.time}`).join(', ')}` : ''}
            >
              {date.getDate()}
              {isToday && <div className="today-marker">Сегодня</div>}
              {isBusy && <div className="busy-marker">{dateAppointments.length}</div>}
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