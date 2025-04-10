import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError('Профиль не найден');
          }
        }
      } catch (err) {
        setError('Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      setError('Ошибка при выходе');
    }
  };

  if (loading) return <div>Загрузка профиля...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <h2>Ваш профиль</h2>
      
      {userData && (
        <div className="profile-info">
          <p><strong>Имя:</strong> {userData.name || 'Не указано'}</p>
          <p><strong>Email:</strong> {userData.email || 'Не указан'}</p>
          <p><strong>Телефон:</strong> {userData.phone || 'Не указан'}</p>
          
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}