import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail
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

  // Перенаправляем если пользователь уже авторизован
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) navigate('/booking');
    });
    return unsubscribe;
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Сбрасываем ошибку при изменении поля
  };

  // Проверка существования email перед регистрацией
  const checkEmailExists = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error("Ошибка проверки email:", error);
      return false;
    }
  };

  const validateForm = async () => {
    // Общие проверки для всех форм
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Введите корректный email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    // Дополнительные проверки для регистрации
    if (mode === 'register') {
      if (!formData.name.trim()) {
        setError('Введите имя');
        return false;
      }

      if (!/^[\d\+]{10,15}$/.test(formData.phone)) {
        setError('Введите корректный телефон (10-15 цифр)');
        return false;
      }

      // Проверка на существующий email
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setError('Этот email уже зарегистрирован');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!(await validateForm())) return;
    
    setIsLoading(true);

    try {
      if (mode === 'register') {
        // 1. Регистрация пользователя
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // 2. Обновление профиля
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });

        // 3. Сохранение дополнительных данных
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Вход существующего пользователя
        await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Обновляем время последнего входа
        if (auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            lastLogin: new Date().toISOString()
          });
        }
      }
      
      navigate('/booking');
    } catch (error) {
      console.error("Ошибка аутентификации:", error);
      setError(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/email-already-in-use':
        return 'Этот email уже зарегистрирован. Войдите или используйте другой email';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/invalid-credential':
        return 'Неверный email или пароль';
      case 'auth/weak-password':
        return 'Пароль должен содержать минимум 6 символов';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже или сбросьте пароль';
      case 'auth/user-not-found':
        return 'Пользователь не найден. Зарегистрируйтесь';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/network-request-failed':
        return 'Проблемы с интернет-соединением';
      default:
        return 'Произошла ошибка. Попробуйте еще раз';
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === 'register' ? 'Регистрация' : 'Вход'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label htmlFor="name">Имя*</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя"
                required
                minLength={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Телефон*</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+79001234567"
                required
                pattern="[\d\+]{10,15}"
                title="10-15 цифр, можно с +"
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль*</label>
          <input
            id="password"
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
          className={`auth-button ${isLoading ? 'loading' : ''}`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="button-loader"></span>
          ) : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <div className="auth-switch">
          {mode === 'register' ? (
            <p>Уже есть аккаунт?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="link-button"
              >
                Войти
              </button>
            </p>
          ) : (
            <p>Нет аккаунта?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/register')}
                className="link-button"
              >
                Зарегистрироваться
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}