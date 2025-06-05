import { useState, useEffect } from 'react';
import styled from 'styled-components';

// Re-use styled components or define similar ones if needed
const PageContainer = styled.div`
  h2 {
    color: #333;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }
`;

const CodeBlock = styled.pre`
  background-color: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #ddd;

  margin-left: 0;
  margin-right: auto;
  text-align: left;
`;

const LoadingText = styled.p`
  font-style: italic;
  color: #555;
`;

const ErrorText = styled.p`
  color: red;
  font-weight: bold;
`;

export default function PositionsPage() {
  const [positions, setPositions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8080/positions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPositions(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch positions:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  if (loading) return <LoadingText>Загрузка должностей...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке должностей: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Должности</h2>
      {positions ? (
        <CodeBlock>
          <code>
            {JSON.stringify(positions, null, 2)}
          </code>
        </CodeBlock>
      ) : (
        <p>Нет данных для отображения.</p>
      )}
    </PageContainer>
  );
}