import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу входа, запоминая, откуда пришли
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Если роут только для админа и пользователь не админ
  if (adminOnly && user?.role !== 'ROLE_ADMIN') {
      // Можно перенаправить на страницу с ошибкой доступа или на главную
      return <Navigate to="/user" replace />;
  }

  return children;
}