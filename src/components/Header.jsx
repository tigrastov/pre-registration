import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Массажный кабинет доктора Шухова
        </Link>
        
        <nav className="main-nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/booking" className="nav-link">Онлайн-Запись</Link>
          {user?.email === 'admin@example.com' && (
            <Link to="/admin" className="nav-link">Админ-панель</Link>
          )}
        </nav>
        
        <div className="user-controls">
          <button 
            onClick={handleAuthClick}
            className="auth-button"
          >
            {user ? 'Мой профиль' : 'Войти'}
          </button>
        </div>
      </div>
    </header>
  );
}