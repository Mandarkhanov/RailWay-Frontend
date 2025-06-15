import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 200px;
  background-color: transparent;
  color: #555;
  padding: 2rem 20px; 
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const SidebarButton = styled.button`
  background-color: ${props => props.$isActive ? '#e6f4ff' : 'transparent'};
  color: ${props => props.$isActive ? '#3498db' : '#555'};
  border: none;
  padding: 10px 15px;
  margin-bottom: 8px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.$isActive ? '#d1e9ff' : '#e9ecef'};
  }
`;

export default function UserSideBar({ setActiveView, activeView }) {
  return (
    <SidebarContainer>
       <SidebarButton
        onClick={() => setActiveView('home')}
        $isActive={activeView === 'home'}
      >
        Главная
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('tickets')}
        $isActive={activeView === 'tickets'}
      >
        Мои билеты
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('luggage')}
        $isActive={activeView === 'luggage'}
      >
        Багаж
      </SidebarButton>
    </SidebarContainer>
  );
}