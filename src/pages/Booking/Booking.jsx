import './Booking.css';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import { useState, useEffect } from 'react'; 
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);


  useEffect(() => {
    const q = collection(db, "appointments");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(apps);
    });
    return () => unsubscribe();
  }, []);

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
        <Calendar onDateSelect={setSelectedDate} />
        {selectedDate && (
          <TimeSlots 
            date={selectedDate} 
            appointments={appointments.filter(a => a.date === selectedDate)}
            onBookingSuccess={() => setSelectedDate(null)}
          />
        )}
      </div>
    </main>
  );
}