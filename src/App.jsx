import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import Header from './components/Header';
import Home from './pages/Home';
import Booking from './pages/Booking/Booking';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="auth-loading">Проверка авторизации...</div>;
  }

  return user ? children : <Navigate to="/admin-login" replace />;
};

// Компонент для редиректа авторизованных пользователей
const AuthRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="auth-loading">Проверка авторизации...</div>;
  }

  return user ? <Navigate to="/admin-panel" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        
        {/* Маршрут входа - доступен только НЕавторизованным */}
        <Route
          path="/admin-login"
          element={
            <AuthRoute>
              <AdminLogin />
            </AuthRoute>
          }
        />
        
        {/* Защищённый маршрут - доступен только авторизованным */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        {/* Резервный редирект для несуществующих маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;