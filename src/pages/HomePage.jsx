import styled from 'styled-components';
import { PageContainer } from './pageStyles';

const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  flex-grow: 1; /* Чтобы он занял все доступное место в PageContainer */
`;

const Title = styled.h1`
  font-size: 6rem;
  font-weight: 300;
  color: #e0e0e0;
  user-select: none;
`;

export default function HomePage() {
  return (
    <PageContainer>
      <CenteredContent>
        <Title>Hello from Danil</Title>
      </CenteredContent>
    </PageContainer>
  );
}