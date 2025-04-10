import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Проверка доступа...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.email !== 'admin@example.com') {
    return <Navigate to="/" replace />;
  }

  return children;
}