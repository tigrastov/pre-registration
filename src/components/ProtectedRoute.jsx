import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function ProtectedRoute({ children, adminOnly = false }) {

  if (adminOnly) {
    return auth.currentUser?.email === 'ura@admin.com' 
      ? children 
      : <Navigate to="/" replace />;
  }
  

  return auth.currentUser ? children : <Navigate to="/login" replace />;
}