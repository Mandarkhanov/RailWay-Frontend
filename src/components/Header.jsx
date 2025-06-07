import styled from 'styled-components';

const HeaderContainer = styled.header`
  padding: 0 25px;
  background-color: #2c3e50; /* Тот же цвет, что и у сайдбара */
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  flex-shrink: 0; /* Предотвращает сжатие хедера */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
`;

const LogoButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.6em;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`;

const DateDisplay = styled.p`
  font-size: 0.9em;
  margin: 0;
`;

export default function Header({ onLogoClick }) {
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <HeaderContainer>
      <LogoButton onClick={onLogoClick}>RailWay</LogoButton>
      <DateDisplay>{today}</DateDisplay>
    </HeaderContainer>
  );
}