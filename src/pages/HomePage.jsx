import styled from 'styled-components';

const HomePageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 6rem;
  font-weight: 300;
  color: #e0e0e0;
  user-select: none;
`;

export default function HomePage() {
  return (
    <HomePageContainer>
      <Title>Hello from Danil</Title>
    </HomePageContainer>
  );
}