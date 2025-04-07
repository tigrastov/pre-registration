import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Защита маршрута
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) navigate('/admin-login');
    });
    return unsubscribe;
  }, [navigate]);

  // Загрузка данных
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      setBookings(bookings.map(b => 
        b.id === id ? {...b, status} : b
      ));
    } catch (err) {
      console.error("Ошибка обновления:", err);
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Панель администратора</h1>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </header>

      <div className="bookings-list">
        <h2>Записи клиентов</h2>
        
        {bookings.length === 0 ? (
          <p>Нет активных записей</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.name}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.date}</td>
                  <td>{booking.status || 'Новая'}</td>
                  <td className="actions">
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="confirm-button"
                    >
                      Подтвердить
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="cancel-button"
                    >
                      Отменить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}