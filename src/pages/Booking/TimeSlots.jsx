import { useState, useEffect } from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import './TimeSlots.css';
import './AuthModal.css';

const ALL_TIME_SLOTS = ['10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00'];

export default function TimeSlots({ date, appointments, onBookingSuccess }) {
  // Состояния компонента
  const [selectedTime, setSelectedTime] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [errorTimeout, setErrorTimeout] = useState(null);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [errorTimeout]);

  // Показать ошибку с автоскрытием
  const showError = (message, duration = 5000) => {
    setError(message);
    if (errorTimeout) clearTimeout(errorTimeout);
    setErrorTimeout(setTimeout(() => setError(null), duration));
  };

  // Проверка занятости времени
  const isTimeBooked = (time) => {
    return appointments.some(app => app.date === date && app.time === time);
  };

  // Проверка существующей записи пользователя
  const hasUserBookingToday = () => {
    if (!auth.currentUser) return false;
    return appointments.some(app => 
      app.userId === auth.currentUser.uid && 
      app.date === date
    );
  };

  // Обработчик выбора времени
  const handleTimeSelect = (time) => {
    // Сброс предыдущих ошибок
    setError(null);
    if (errorTimeout) clearTimeout(errorTimeout);

    // Проверки
    if (isTimeBooked(time)) {
      showError('Это время уже занято');
      return;
    }
    
    if (hasUserBookingToday()) {
      showError('Вы уже записаны на этот день');
      return;
    }

    setSelectedTime(time);
    
    if (auth.currentUser) {
      prepareBooking(auth.currentUser);
    } else {
      setShowAuthModal(true);
    }
  };

  // Подготовка данных записи
  const prepareBooking = (user) => {
    const booking = {
      userId: user.uid,
      userName: user.displayName || formData.name || 'Не указано',
      userPhone: formData.phone || 'Не указан',
      date,
      time: selectedTime,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    
    setBookingData(booking);
    setShowConfirmation(true);
  };

  // Подтверждение записи
  const confirmBooking = async () => {
    try {
      if (!bookingData) {
        throw new Error('Отсутствуют данные для записи');
      }

      await addDoc(collection(db, "appointments"), bookingData);
      
      // Сброс состояния
      setShowConfirmation(false);
      setSelectedTime(null);
      setBookingData(null);
      
      // Обновление списка записей
      onBookingSuccess();
    } catch (error) {
      console.error('Ошибка записи:', error);
      showError('Ошибка при подтверждении записи');
    }
  };

  // Обработка авторизации/регистрации
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      let user;
      
      if (isLogin) {
        // Вход
        const { user: authUser } = await signInWithEmailAndPassword(
          auth, formData.email, formData.password
        );
        user = authUser;
      } else {
        // Регистрация
        const { user: authUser } = await createUserWithEmailAndPassword(
          auth, formData.email, formData.password
        );
        
        // Обновление профиля
        await updateProfile(authUser, {
          displayName: formData.name
        });
        
        user = authUser;
        
        // Сохранение в коллекции users
        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          createdAt: new Date().toISOString()
        });
      }
      
      // Подготовка записи после успешной авторизации
      prepareBooking(user);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      showError(getAuthErrorMessage(error.code));
    }
  };

  // Получение понятного сообщения об ошибке
  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/email-already-in-use':
        return 'Этот email уже зарегистрирован';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/weak-password':
        return 'Пароль должен содержать минимум 6 символов';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      default:
        return 'Ошибка при аутентификации';
    }
  };

  return (
    <div className="time-slots-container">
      <h3>Выберите время на {date}</h3>
      
      {/* Сетка времени */}
      <div className="time-slots-grid">
        {ALL_TIME_SLOTS.map(time => (
          <button
            key={time}
            className={`time-slot ${isTimeBooked(time) ? 'booked' : ''}`}
            onClick={() => handleTimeSelect(time)}
            disabled={isTimeBooked(time)}
          >
            {time}
            {isTimeBooked(time) && <span className="booked-label">Занято</span>}
          </button>
        ))}
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="error-message">
          {error}
          <button 
            className="error-close"
            onClick={() => {
              setError(null);
              if (errorTimeout) clearTimeout(errorTimeout);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Модальное окно авторизации */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button"
              onClick={() => setShowAuthModal(false)}
            >
              &times;
            </button>
            
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ваше имя"
                      required
                      minLength={2}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Телефон"
                      required
                      pattern="[\d\+]{10,15}"
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Email"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Пароль"
                  required
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="auth-submit-button">
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            
            <div className="auth-switch">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="switch-mode-button"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Окно подтверждения записи */}
      {showConfirmation && bookingData && (
        <div className="confirmation-modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button"
              onClick={() => setShowConfirmation(false)}
            >
              &times;
            </button>
            
            <h2>Подтверждение записи</h2>
            
            <div className="booking-info">
              <p><strong>Дата:</strong> {bookingData.date}</p>
              <p><strong>Время:</strong> {bookingData.time}</p>
              <p><strong>Имя:</strong> {bookingData.userName}</p>
              <p><strong>Телефон:</strong> {bookingData.userPhone}</p>
            </div>
            
            <div className="confirmation-actions">
              <button 
                onClick={confirmBooking}
                className="confirm-button"
              >
                Подтвердить
              </button>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="cancel-button"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}