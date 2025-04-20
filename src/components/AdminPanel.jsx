import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AdminPanel.css';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Функция обновления статуса
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { 
        status: newStatus 
      });
      
      // Обновляем локальное состояние
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionDate: new Date(`${doc.data().date}T${doc.data().time}`)
      }));
      
      // Сортировка по дате сеанса
      const sortedBookings = bookingsData.sort((a, b) => 
        a.sessionDate - b.sessionDate
      );
      
      setBookings(sortedBookings);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-container">
      <h1>Админ-панель</h1>
      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-info">
              <h3>{booking.userName}</h3>
              <p>📞 {booking.userPhone}</p>
              <p>📅 {booking.date} в {booking.time}</p>
              <p>Статус: {booking.status || 'ожидает'}</p>
            </div>
            
            <div className="booking-actions">
              <button 
                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                className={booking.status === 'confirmed' ? 'active' : ''}
              >
                Подтвердить
              </button>
              <button 
                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                className={booking.status === 'cancelled' ? 'active' : ''}
              >
                Отменить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}