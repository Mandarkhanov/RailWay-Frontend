import { useState } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';
import UserSideBar from '../components/UserSideBar';
import { PageContainer, PageHeader } from '../pages/pageStyles';

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

const PlaceholderPage = ({ title }) => (
    <PageContainer>
        <PageHeader><h2>{title}</h2></PageHeader>
        <div style={{ flexGrow: 1, display: 'grid', placeContent: 'center' }}>
            <p>In Develop</p>
        </div>
    </PageContainer>
);

export default function UserLayout() {
  const [activeView, setActiveView] = useState('tickets');

  const renderView = () => {
    switch (activeView) {
      case 'tickets':
        return <PlaceholderPage title="Мои билеты" />;
      case 'luggage':
        return <PlaceholderPage title="Багаж" />;
      default:
        return <PlaceholderPage title="Мои билеты" />;
    }
  };

  return (
    <AppContainer>
      <Header />
      <ContentContainer>
        <UserSideBar setActiveView={setActiveView} activeView={activeView} />
        <MainContent>
          {renderView()}
        </MainContent>
      </ContentContainer>
    </AppContainer>
  );
}