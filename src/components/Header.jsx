import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import './Header.css';
import './ProfileModal.css';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          await setDoc(docRef, {
            name: user.displayName || '',
            phone: '',
            email: user.email
          });
        }
        setUser(user);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Ошибка загрузки профиля");
      } finally {
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, []);

  const handleAuthClick = () => {
    if (loading) return;
    user ? setShowProfileModal(true) : navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      setError(null);
      await updateProfile(auth.currentUser, {
        displayName: profileData.name
      });
      
      await updateDoc(doc(db, "users", user.uid), {
        name: profileData.name,
        phone: profileData.phone
      });
      
      setEditMode(false);
      showProfileModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Ошибка сохранения профиля");
    }
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowProfileModal(false);
      setEditMode(false);
      setError(null);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">Массажный кабинет</Link>
        
        <nav className="main-nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/booking" className="nav-link">Запись</Link>
          {user?.email === 'admin@example.com' && (
            <Link to="/admin" className="nav-link">Админ</Link>
          )}
        </nav>
        
        <div className="user-controls">
          <button 
            onClick={handleAuthClick} 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '...' : user ? user.displayName || 'Профиль' : 'Войти'}
          </button>
        </div>
      </div>

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={closeModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-button"
              onClick={() => setShowProfileModal(false)}
            >
              &times;
            </button>
            
            <h2 className="modal-title">Ваш профиль</h2>
            
            {error && <div className="profile-error">{error}</div>}
            
            {editMode ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Имя:</label>
                  <input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Ваше имя"
                  />
                </div>
                
                <div className="form-group">
                  <label>Телефон:</label>
                  <input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <div className="modal-buttons">
                  <button 
                    onClick={handleSaveProfile}
                    className="modal-button primary"
                  >
                    Сохранить
                  </button>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="modal-button secondary"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-info">
                  <div className="info-item">
                    <span className="info-label">Имя:</span>
                    <span className="info-value">{user?.displayName || 'Не указано'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Телефон:</span>
                    <span className="info-value">{profileData.phone || 'Не указан'}</span>
                  </div>
                </div>
                
                <div className="modal-buttons">
                  <button 
                    onClick={() => setEditMode(true)}
                    className="modal-button"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => auth.signOut()}
                    className="modal-button logout"
                  >
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}