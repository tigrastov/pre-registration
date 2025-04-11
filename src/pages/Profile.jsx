import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Profile.css';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка профиля
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (auth.currentUser) {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setFormData({
              name: docSnap.data().name || '',
              phone: docSnap.data().phone || ''
            });
          }
        }
      } catch (err) {
        setError('Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Сохранение изменений
  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      setError('Заполните все поля');
      return;
    }

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: formData.name,
        phone: formData.phone
      });
      setUserData({ ...userData, ...formData });
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  if (loading) return <div className="profile-loading">Загрузка...</div>;
  if (!userData) return <div className="profile-error">Профиль не найден</div>;

  return (
    <div className="profile-container">
      <h2>Ваш профиль</h2>
      
      {editMode ? (
        <div className="profile-edit-form">
          <div className="form-group">
            <label>Имя:</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Телефон:</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="profile-actions">
            <button onClick={handleSave} className="save-btn">Сохранить</button>
            <button onClick={() => setEditMode(false)} className="cancel-btn">Отмена</button>
          </div>
        </div>
      ) : (
        <div className="profile-info">
          <p><strong>Имя:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Телефон:</strong> {userData.phone}</p>
          <button onClick={() => setEditMode(true)} className="edit-btn">Редактировать</button>
        </div>
      )}
      
      {error && <div className="profile-error">{error}</div>}
    </div>
  );
}