import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/admin-panel');
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin-panel');
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      console.error("Ошибка входа:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для понятных сообщений об ошибках
  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-credential': return 'Неверный email или пароль';
      case 'auth/too-many-requests': return 'Слишком много попыток. Попробуйте позже';
      default: return 'Ошибка при входе';
    }
  };

  return (
    <div className="login-container">
      <h2>Вход для администратора</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
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
            placeholder="••••••••"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}