import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/booking');
    });
    return unsubscribe;
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.name.trim()) {
        setError('Введите имя');
        return false;
      }
      if (!/^[\d\+]{10,15}$/.test(formData.phone)) {
        setError('Введите корректный телефон (10-15 цифр)');
        return false;
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        // 1. Создаем пользователя
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // 2. Обновляем профиль
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });

        // 3. Сохраняем дополнительные данные
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate('/booking');
    } catch (err) {
      let errorMessage = 'Ошибка при аутентификации';
      if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Проблемы с интернет-соединением. Проверьте сеть.';
      } else {
        errorMessage = getAuthErrorMessage(err.code) || errorMessage;
      }
      setError(errorMessage);
      console.error("Auth error details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/email-already-in-use': 
        return 'Этот email уже зарегистрирован';
      case 'auth/invalid-credential': 
        return 'Неверный email или пароль';
      case 'auth/weak-password': 
        return 'Пароль должен содержать минимум 6 символов';
      case 'auth/too-many-requests': 
        return 'Слишком много попыток. Попробуйте позже';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      default: 
        return 'Ошибка при аутентификации';
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === 'register' ? 'Регистрация' : 'Вход'}</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label>Имя*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя"
                required
              />
            </div>
            <div className="form-group">
              <label>Телефон*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+79001234567"
                required
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Пароль*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
            required
            minLength={6}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="auth-button"
        >
          {isLoading ? 'Загрузка...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <div className="auth-switch">
          {mode === 'register' ? (
            <p>Уже есть аккаунт? <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Войти
            </button></p>
          ) : (
            <p>Нет аккаунта? <button 
              type="button" 
              onClick={() => navigate('/register')}
              className="link-button"
            >
              Зарегистрироваться
            </button></p>
          )}
        </div>
      </form>
    </div>
  );
}