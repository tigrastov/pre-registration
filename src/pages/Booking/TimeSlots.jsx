import { useState, useEffect } from 'react';
import { 
  addDoc, collection, query, where, onSnapshot,
  doc, getDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import './TimeSlots.css';

const ALL_TIME_SLOTS = ['10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00'];

export default function TimeSlots({ date, appointments }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const isSlotBooked = (time) => 
    appointments.some(app => app.time === time);

  const handleTimeSelect = (time) => {
    if (isSlotBooked(time)) return;
    setSelectedTime(time);
    setAuthModal(auth.currentUser ? 'confirm' : 'register');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, formData.email, formData.password
      );
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });

      await addDoc(collection(db, "appointments"), {
        userId: userCredential.user.uid,
        userName: formData.name,
        userPhone: formData.phone,
        date,
        time: selectedTime,
        createdAt: new Date().toISOString()
      });

      setAuthModal(null);
      setSelectedTime(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="timeslots-container">
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

      {/* Модальные окна */}
      {authModal === 'register' && (
        <div className="modal">
          <form onSubmit={handleRegister}>
            <input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Имя"
              required
            />
            <input
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Телефон"
              required
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Пароль"
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Зарегистрироваться</button>
          </form>
        </div>
      )}
    </div>
  );
}