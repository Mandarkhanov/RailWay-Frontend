import { useState } from 'react';
import styled from 'styled-components';
import SideBar from './SideBar';
import DepartmentsPage from '../pages/DepartmentsPage';
import PositionsPage from '../pages/PositionsPage';
import EmployeesPage from '../pages/EmployeesPage';
import BrigadesPage from '../pages/BrigadesPage';
import MedicalExaminationsPage from '../pages/MedicalExaminationsPage';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; // from your index.css
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 20px;
  background-color: #f0f2f5; // A slightly different background for the content
  color: #333; // Default text color for content area
`;

const PlaceholderText = styled.p`
  font-size: 1.2em;
  color: #666;
`;

export default function AdminLayout() {
  const [activeView, setActiveView] = useState(null); // 'departments', 'positions', 'employees', 'brigades', 'medical-examinations' or null

  const renderView = () => {
    switch (activeView) {
      case 'departments':
        return <DepartmentsPage />;
      case 'positions':
        return <PositionsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'brigades':
        return <BrigadesPage />;
      case 'medical-examinations':
        return <MedicalExaminationsPage />;
      default:
        return <PlaceholderText>Выберите раздел в меню слева.</PlaceholderText>;
    }
  };

  return (
    <LayoutContainer>
      <SideBar setActiveView={setActiveView} activeView={activeView} />
      <MainContent>
        {renderView()}
      </MainContent>
    </LayoutContainer>
  );
}