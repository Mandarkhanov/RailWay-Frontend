import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  padding: 0 2rem;
  background-color: transparent;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  flex-shrink: 0;
  z-index: 10;
`;

const LogoButton = styled.button`
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 1.6em;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const LogoutButton = styled.button`
    background: #e74c3c;
    border: 1px solid #c0392b;
    color: #fff;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    &:hover {
        background: #c0392b;
    }
`;

export default function Header({ setActiveView }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
      if(user.role === 'ROLE_ADMIN') {
          navigate('/');
      } else {
          navigate('/user');
          if (setActiveView) {
            setActiveView('home');
          }
      }
  };

  return (
    <HeaderContainer>
      <LogoButton onClick={handleLogoClick}>RailWay</LogoButton>
      <ProfileContainer>
        <LogoutButton onClick={logout}>
          Выйти
        </LogoutButton>
        <ProfileIcon>{user?.email?.[0]?.toUpperCase() || 'U'}</ProfileIcon>
      </ProfileContainer>
    </HeaderContainer>
  );
}