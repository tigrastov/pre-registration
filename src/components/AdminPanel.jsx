import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user || user.email !== 'admin@example.com') {
        navigate('/admin-login');
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const loadBookings = async () => {
      const snapshot = await getDocs(collection(db, 'appointments'));
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'appointments', id), { status });
    setBookings(bookings.map(b => b.id === id ? {...b, status} : b));
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-container">
      <h1>Панель администратора</h1>
      <button onClick={() => signOut(auth)}>Выйти</button>
      
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Дата</th>
            <th>Время</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{booking.userName}</td>
              <td>{booking.userPhone}</td>
              <td>{booking.date}</td>
              <td>{booking.time}</td>
              <td>{booking.status || 'new'}</td>
              <td>
                <button onClick={() => updateStatus(booking.id, 'confirmed')}>
                  Подтвердить
                </button>
                <button onClick={() => updateStatus(booking.id, 'cancelled')}>
                  Отменить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}