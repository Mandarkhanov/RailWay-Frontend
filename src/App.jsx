import { useState } from 'react';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

export default function App() {
  // 'admin', 'user', 'login', 'register'
  const [currentView, setCurrentView] = useState('admin'); 

  const handleSwitchView = (view) => {
    setCurrentView(view);
  };

  switch (currentView) {
    case 'user':
      return <UserLayout currentView={currentView} onSwitchView={handleSwitchView} />;
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegistrationPage />;
    case 'admin':
    default:
      return <AdminLayout currentView={currentView} onSwitchView={handleSwitchView} />;
  }
}