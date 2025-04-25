import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AdminPanel.css';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { 
        status: newStatus 
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };


  const handleDeleteBooking = async (id) => {
    if (window.confirm('Вы точно хотите удалить эту запись?')) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionDate: new Date(`${doc.data().date}T${doc.data().time}`)
      }));
      
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
              <p className="status">
                Статус: {booking.status === 'confirmed' 
                  ? 'Подтвержден' 
                  : booking.status === 'cancelled' 
                    ? 'Отменен' 
                    : 'Не подтвержден'}
              </p>
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
              <button 
                onClick={() => handleDeleteBooking(booking.id)}
                className="delete-button"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}