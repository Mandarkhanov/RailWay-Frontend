import { useState } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';
import UserSideBar from '../components/UserSideBar';
import UserTicketsPage from '../pages/UserTicketsPage';
import UserHomePage from '../pages/UserHomePage';

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
`;

const PlaceholderPage = ({ title }) => (
    <div style={{ padding: '2rem' }}>
      <h2>{title}</h2>
      <p>Эта страница находится в разработке.</p>
    </div>
);

export default function UserLayout() {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <UserHomePage />;
      case 'tickets':
        return <UserTicketsPage />;
      case 'luggage':
        return <PlaceholderPage title="Багаж" />;
      default:
        return <UserHomePage />;
    }
  };

  return (
    <AppContainer>
      <Header setActiveView={setActiveView} />
      <ContentContainer>
        <UserSideBar setActiveView={setActiveView} activeView={activeView} />
        <MainContent>
          {renderView()}
        </MainContent>
      </ContentContainer>
    </AppContainer>
  );
}