import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import './TimeSlots.css';

const availableSlots = [
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
    lastName: '',
    phone: '',
    age: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (time) => {
    if (!formData.name || !formData.phone) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "appointments"), {
        date,
        time,
        ...formData,
        createdAt: new Date().toISOString()
      });
      alert('Запись успешно сохранена!');
      setFormData({
        name: '',
        lastName: '',
        phone: '',
        age: '',
        time: ''
      });
    } catch (error) {
      console.error("Error adding appointment: ", error);
      alert('Ошибка при сохранении записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotBooked = (time) => {
    return appointments.some(app => app.time === time);
  };

  return (
    <div className="timeslots-wrapper">
      <h3>Запись на {date}</h3>
      
      <div className="client-form">
        <h4>Ваши данные:</h4>
        <input
          type="text"
          name="name"
          placeholder="Имя*"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Фамилия"
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Телефон*"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Возраст"
          value={formData.age}
          onChange={handleInputChange}
        />
      </div>

      <div className="timeslots-grid">
        {availableSlots.map((time, index) => {
          const isBooked = isSlotBooked(time);
          
          return (
            <div key={index} className="timeslot-container">
              <button
                className={`timeslot ${isBooked ? 'booked' : ''} ${formData.time === time ? 'selected' : ''}`}
                disabled={isBooked || isSubmitting}
                onClick={() => setFormData(prev => ({ ...prev, time }))}
              >
                {time}
                {isBooked && <span> (Занято)</span>}
              </button>
            </div>
          );
        })}
      </div>

      {formData.time && (
        <button 
          className="submit-btn"
          onClick={() => handleSubmit(formData.time)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Подтвердить запись'}
        </button>
      )}
    </div>
  );
}