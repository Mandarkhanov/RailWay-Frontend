import styled from 'styled-components';

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

// Временная кнопка для переключения
const SwitchButton = styled.button`
    background: #e9ecef;
    border: 1px solid #ced4da;
    color: #495057;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8em;
    &:hover {
        background: #ced4da;
    }
`;

export default function Header({ onLogoClick, currentView, onSwitchView }) {
  const isUserView = currentView === 'user';

  return (
    <HeaderContainer>
      <LogoButton onClick={onLogoClick}>RailWay</LogoButton>
      <ProfileContainer>
        {/* Кнопка для переключения на страницу входа */}
        <SwitchButton onClick={() => onSwitchView('login')}>
          Войти
        </SwitchButton>
        {/* Кнопка для переключения между админкой и пользовательским видом */}
        <SwitchButton onClick={() => onSwitchView(isUserView ? 'admin' : 'user')}>
          {isUserView ? 'Вид админа' : 'Вид юзера'}
        </SwitchButton>
        <ProfileIcon>U</ProfileIcon>
      </ProfileContainer>
    </HeaderContainer>
  );
}