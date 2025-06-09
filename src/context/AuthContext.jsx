import { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext(null);

// Хелпер для декодирования JWT (упрощенный)
const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const user = useMemo(() => {
    if (!token) return null;
    const decoded = decodeJwt(token);
    // Теперь мы знаем, что claim называется 'role' и это массив
    return { email: decoded?.sub, role: decoded?.role?.[0] }; 
  }, [token]);
  
  const authLogin = async (credentials) => {
      const response = await api.login(credentials);
      const newToken = response.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);

      // Логика навигации теперь здесь, где ей и место
      const newUser = decodeJwt(newToken);
      if (newUser?.role?.[0] === 'ROLE_ADMIN') {
          navigate('/');
      } else {
          navigate('/user');
      }
  };
  
  const register = async (userData) => {
      const response = await api.register(userData);
      const newToken = response.token;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // После регистрации всегда переходим в личный кабинет пользователя
      navigate('/user');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    isAuthenticated,
    login: authLogin,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Хук для удобного доступа к контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};