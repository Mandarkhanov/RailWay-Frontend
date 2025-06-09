import { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import HomePage from '../pages/HomePage';
import DepartmentsPage from '../pages/DepartmentsPage';
import PositionsPage from '../pages/PositionsPage';
import EmployeesPage from '../pages/EmployeesPage';
import BrigadesPage from '../pages/BrigadesPage';
import MedicalExaminationsPage from '../pages/MedicalExaminationsPage';
import SqlQueriesPage from '../pages/SqlQueriesPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden; 
`;

const MainContent = styled.main`
  flex-grow: 1;
  overflow-y: auto; 
  padding: 2rem;
`;

export default function AdminLayout({ currentView, onSwitchView }) {
  const [activeView, setActiveView] = useState('home');

  const showHomePage = () => {
    setActiveView('home');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomePage />;
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
      case 'sql-queries':
        return <SqlQueriesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AppContainer>
      <Header onLogoClick={showHomePage} currentView={currentView} onSwitchView={onSwitchView} />
      <ContentContainer>
        <SideBar setActiveView={setActiveView} activeView={activeView} />
        <MainContent>
          {renderView()}
        </MainContent>
      </ContentContainer>
    </AppContainer>
  );
}