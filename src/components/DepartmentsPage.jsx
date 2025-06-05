import { useState, useEffect } from 'react';
import styled from 'styled-components';

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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8080/departments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDepartments(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch departments:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) return <LoadingText>Загрузка отделов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке отделов: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Отделы</h2>
      {departments ? (
        <CodeBlock>
          <code>
            {JSON.stringify(departments, null, 2)}
          </code>
        </CodeBlock>
      ) : (
        <p>Нет данных для отображения.</p>
      )}
    </PageContainer>
  );
}