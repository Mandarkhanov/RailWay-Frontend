import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 220px;
  background-color: #2c3e50; /* A darker sidebar color */
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Prevent sidebar from shrinking */
`;

const SidebarTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5em;
  border-bottom: 1px solid #46627f;
  padding-bottom: 10px;
`;

const SidebarButton = styled.button`
  background-color: ${props => props.isActive ? '#3498db' : '#34495e'};
  color: white;
  border: none;
  padding: 12px 18px;
  margin-bottom: 10px;
  text-align: left;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1em;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.isActive ? '#2980b9' : '#4a6279'};
  }
`;

export default function SideBar({ setActiveView, activeView }) {
  return (
    <SidebarContainer>
      <SidebarTitle>Навигация</SidebarTitle>
      <SidebarButton
        onClick={() => setActiveView('departments')}
        isActive={activeView === 'departments'}
      >
        Отделы
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('positions')}
        isActive={activeView === 'positions'}
      >
        Должности
      </SidebarButton>
    </SidebarContainer>
  );
}