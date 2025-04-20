import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function ProtectedRoute({ children, adminOnly = false }) {
  // Если требуется доступ только для админа
  if (adminOnly) {
    return auth.currentUser?.email === 'ura@admin.com' 
      ? children 
      : <Navigate to="/" replace />;
  }
  
  // Для защищенных роутов (не только админ)
  return auth.currentUser ? children : <Navigate to="/login" replace />;
}