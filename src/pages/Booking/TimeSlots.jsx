import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import './TimeSlots.css';

const timeSlots = [
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
];

export default function TimeSlots({ date, appointments }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: ''
  });

  const isSlotBooked = (time) => {
    return appointments.some(app => app.time === time);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.time) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        ...formData,
        date,
        createdAt: new Date().toISOString()
      });
      alert('✅ Запись успешно сохранена!');
      setFormData({ name: '', phone: '', time: '' });
    } catch (error) {
      console.error("Ошибка записи:", error);
      alert('❌ Ошибка при сохранении записи');
    }
  };

  return (
    <div className="timeslots-wrapper">
      <h3>Запись на {date}</h3>
      
      <div className="client-form">
        <input
          type="text"
          placeholder="Имя*"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="tel"
          placeholder="Телефон*"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>

      <div className="timeslots-grid">
        {timeSlots.map((time, index) => {
          const isBooked = isSlotBooked(time);
          
          return (
            <button
              key={index}
              className={`timeslot ${isBooked ? 'booked' : ''} ${formData.time === time ? 'selected' : ''}`}
              disabled={isBooked}
              onClick={() => setFormData({...formData, time})}
            >
              {time}
              {isBooked && <span className="booked-badge">Занято</span>}
            </button>
          );
        })}
      </div>

      {formData.time && (
        <button className="submit-btn" onClick={handleSubmit}>
          Записаться
        </button>
      )}
    </div>
  );
}