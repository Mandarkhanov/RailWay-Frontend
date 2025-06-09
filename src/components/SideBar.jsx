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

export default function SideBar({ setActiveView, activeView }) {
  return (
    <SidebarContainer>
      <SidebarButton
        onClick={() => setActiveView('departments')}
        $isActive={activeView === 'departments'}
      >
        Отделы
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('positions')}
        $isActive={activeView === 'positions'}
      >
        Должности
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('employees')}
        $isActive={activeView === 'employees'}
      >
        Сотрудники
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('brigades')}
        $isActive={activeView === 'brigades'}
      >
        Бригады
      </SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('medical-examinations')}
        $isActive={activeView === 'medical-examinations'}
      >
        Медосмотры
      </SidebarButton>
      <SidebarButton onClick={() => setActiveView('trains')} $isActive={activeView === 'trains'}>Поезда</SidebarButton>
      <SidebarButton onClick={() => setActiveView('cars')} $isActive={activeView === 'cars'}>Вагоны</SidebarButton>
      <SidebarButton onClick={() => setActiveView('seats')} $isActive={activeView === 'seats'}>Места</SidebarButton>
      <SidebarButton onClick={() => setActiveView('stations')} $isActive={activeView === 'stations'}>Станции</SidebarButton>
      <SidebarButton onClick={() => setActiveView('routes')} $isActive={activeView === 'routes'}>Маршруты</SidebarButton>
      <SidebarButton onClick={() => setActiveView('route-stops')} $isActive={activeView === 'route-stops'}>Остановки</SidebarButton>
      <SidebarButton onClick={() => setActiveView('schedules')} $isActive={activeView === 'schedules'}>Рейсы</SidebarButton>
      <SidebarButton onClick={() => setActiveView('tickets')} $isActive={activeView === 'tickets'}>Билеты</SidebarButton>
      <SidebarButton onClick={() => setActiveView('passengers')} $isActive={activeView === 'passengers'}>Пассажиры</SidebarButton>
      <SidebarButton onClick={() => setActiveView('luggage')} $isActive={activeView === 'luggage'}>Багаж</SidebarButton>
      <SidebarButton onClick={() => setActiveView('maintenances')} $isActive={activeView === 'maintenances'}>Тех. обслуживание</SidebarButton>
      <SidebarButton
        onClick={() => setActiveView('sql-queries')}
        $isActive={activeView === 'sql-queries'}
      >
        SQL запросы
      </SidebarButton>
    </SidebarContainer>
  );
}