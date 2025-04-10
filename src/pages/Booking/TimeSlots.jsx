import { useState, useEffect } from 'react';
import { addDoc, collection, query, where, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './TimeSlots.css';

const ALL_TIME_SLOTS = [
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
];

export default function TimeSlots({ date }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const q = query(collection(db, "appointments"), where("date", "==", date));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, [date]);

  const isSlotBooked = (time) => appointments.some(app => app.time === time);

  const handleTimeSelect = (time) => {
    if (isSlotBooked(time)) return;
    setSelectedTime(time);
    
    // Если пользователь авторизован - сразу показываем форму подтверждения
    if (auth.currentUser) {
      setAuthModal('confirm');
    } else {
      setAuthModal('register');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Введите имя');
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      setError('Введите корректный телефон');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // 1. Регистрируем пользователя
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2. Сохраняем профиль пользователя
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      // 3. Создаем запись
      await addDoc(collection(db, "appointments"), {
        userId: userCredential.user.uid,
        userName: formData.name,
        userPhone: formData.phone,
        date,
        time: selectedTime,
        createdAt: new Date().toISOString()
      });

      setSuccess('✅ Регистрация и запись прошли успешно!');
      setSelectedTime(null);
      setAuthModal(null);
      setFormData({ name: '', phone: '', email: '', password: '' });
    } catch (error) {
      setError(`Ошибка регистрации: ${error.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setAuthModal('confirm');
    } catch (error) {
      setError(`Ошибка входа: ${error.message}`);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await addDoc(collection(db, "appointments"), {
        userId: auth.currentUser.uid,
        userName: formData.name || auth.currentUser.displayName,
        userPhone: formData.phone,
        date,
        time: selectedTime,
        createdAt: new Date().toISOString()
      });
      setSuccess('✅ Запись успешно создана!');
      setSelectedTime(null);
      setAuthModal(null);
    } catch (error) {
      setError('Ошибка при создании записи');
    }
  };

  return (
    <div className="timeslots-container">
      <h2>Запись на {date}</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="timeslots-grid">
        {ALL_TIME_SLOTS.map(time => (
          <button
            key={time}
            className={`time-slot ${isSlotBooked(time) ? 'booked' : ''}`}
            onClick={() => handleTimeSelect(time)}
            disabled={isSlotBooked(time)}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Модальное окно регистрации */}
      {authModal === 'register' && (
        <div className="auth-modal">
          <div className="auth-content">
            <h3>Регистрация</h3>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Имя*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Телефон*</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="+79001234567"
                />
              </div>
              
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Пароль* (минимум 6 символов)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="auth-button">
                Зарегистрироваться и записаться
              </button>
              
              <button 
                type="button" 
                className="switch-button"
                onClick={() => setAuthModal('login')}
              >
                Уже есть аккаунт? Войти
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно входа */}
      {authModal === 'login' && (
        <div className="auth-modal">
          <div className="auth-content">
            <h3>Вход</h3>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Пароль*</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="auth-button">
                Войти
              </button>
              
              <button 
                type="button" 
                className="switch-button"
                onClick={() => setAuthModal('register')}
              >
                Нет аккаунта? Зарегистрироваться
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения для авторизованных */}
      {authModal === 'confirm' && auth.currentUser && (
        <div className="auth-modal">
          <div className="auth-content">
            <h3>Подтверждение записи</h3>
            <p>Вы записываетесь на {selectedTime}</p>
            
            <div className="form-group">
              <label>Телефон для связи*</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="+79001234567"
              />
            </div>
            
            <button 
              onClick={handleConfirmBooking}
              className="auth-button"
              disabled={!formData.phone}
            >
              Подтвердить запись
            </button>
            
            <button 
              className="cancel-button"
              onClick={() => setAuthModal(null)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}