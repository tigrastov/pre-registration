import { useState } from 'react';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './TimeSlots.css';

const ALL_TIME_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];


export default function TimeSlots({ date, appointments, onBookingSuccess }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeSelect = async (time) => {
    setError(null);
    setSelectedTime(time);

    // Проверка на повторную запись
    const alreadyBooked = appointments.some(
      app => app.userId === auth.currentUser?.uid && app.date === date
    );
    
    if (alreadyBooked) {
      setError('Вы уже записаны на этот день');
      return;
    }

    try {
      // Получаем данные пользователя
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();

      setBookingData({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || userData?.name || 'Гость',
        userPhone: userData?.phone || 'Не указан',
        date,
        time,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      setShowConfirmation(true);
    } catch (err) {
      setError('Ошибка при получении данных профиля');
    }
  };

  const confirmBooking = async () => {
    try {
      setIsLoading(true);
      await addDoc(collection(db, "appointments"), bookingData);
      setShowConfirmation(false);
      onBookingSuccess();
    } catch (err) {
      setError('Ошибка при создании записи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="time-slots-container">
      <div className="time-slots-grid">
        {ALL_TIME_SLOTS.map(time => {
          const isBooked = appointments.some(a => a.time === time && a.date === date);
          return (
            <button
              key={time}
              className={`time-slot ${isBooked ? 'booked' : ''}`}
              onClick={() => !isBooked && handleTimeSelect(time)}
              disabled={isBooked}
            >
              {time}
              {isBooked && <span className="booked-label">Занято</span>}
            </button>
          );
        })}
      </div>

      {showConfirmation && bookingData && (
        <div className="confirmation-modal">
          <h3>Подтверждение записи</h3>
          <div className="booking-info">
            <p><strong>Дата:</strong> {bookingData.date}</p>
            <p><strong>Время:</strong> {bookingData.time}</p>
            <p><strong>Имя:</strong> {bookingData.userName}</p>
            <p><strong>Телефон:</strong> {bookingData.userPhone}</p>
          </div>
          <div className="modal-actions">
            <button 
              onClick={confirmBooking}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Подтвердить'}
            </button>
            <button 
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Отменить
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}