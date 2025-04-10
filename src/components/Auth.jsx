import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/profile');
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/profile');
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      console.error("Ошибка:", err);
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
      default: 
        return 'Ошибка при аутентификации';
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === 'register' ? 'Регистрация' : 'Вход'}</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
            required
            minLength={mode === 'register' ? 6 : undefined}
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
            <p>Уже есть аккаунт? <button type="button" onClick={() => navigate('/login')}>Войти</button></p>
          ) : (
            <p>Нет аккаунта? <button type="button" onClick={() => navigate('/register')}>Зарегистрироваться</button></p>
          )}
        </div>
      </form>
    </div>
  );
}