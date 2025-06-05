import { useState, useEffect } from 'react';
import styled from 'styled-components';
import EmployeeCard from '../components/EmployeeCard';


const PageContainer = styled.div`
  padding: 20px;
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
  margin-left: 0; /* Для выравнивания влево */
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

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
`;

const ButtonGroup = styled.div`
  margin-bottom: 20px;
  button {
    margin-right: 10px;
    padding: 8px 15px;
    border: 1px solid #3498db;
    background-color: #fff;
    color: #3498db;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    &:hover {
      background-color: #2980b9;
      color: #fff;
    }
    &.active {
      background-color: #3498db;
      color: #fff;
    }
  }
`;

const NameList = styled.ul`
  list-style-type: none;
  padding: 0;
  li {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    padding: 8px 12px;
    margin-bottom: 5px;
    border-radius: 4px;
  }
`;


export default function EmployeesPage() {
  const [employees, setEmployees] = useState(null);
  const [employeeNames, setEmployeeNames] = useState(null); // Для полных имен
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [showNamesOnly, setShowNamesOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = showNamesOnly
          ? 'http://localhost:8080/employees/names' // Используем /names, т.к. контроллер так настроен
          : 'http://localhost:8080/employees';
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (showNamesOnly) {
          setEmployeeNames(data);
          setEmployees(null);
        } else {
          setEmployees(data);
          setEmployeeNames(null);
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch employees:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNamesOnly]);

  if (loading) return <LoadingText>Загрузка сотрудников...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке сотрудников: {error}</ErrorText>;

  const displayedData = showNamesOnly ? employeeNames : employees;

  return (
    <PageContainer>
      <h2>Сотрудники</h2>
      <ButtonGroup>
        <button onClick={() => setViewMode('cards')} className={viewMode === 'cards' ? 'active' : ''}>Карточки</button>
        <button onClick={() => setViewMode('json')} className={viewMode === 'json' ? 'active' : ''}>JSON</button>
        <button onClick={() => setShowNamesOnly(prev => !prev)}>
          {showNamesOnly ? 'Показать все данные' : 'Показать только ФИО'}
        </button>
      </ButtonGroup>

      {viewMode === 'json' && displayedData && (
        <CodeBlock><code>{JSON.stringify(displayedData, null, 2)}</code></CodeBlock>
      )}
      {viewMode === 'cards' && (
        showNamesOnly && employeeNames ? (
          <NameList>
            {employeeNames.map((name, index) => <li key={index}>{name}</li>)}
          </NameList>
        ) : employees ? (
          <CardContainer>
            {employees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
          </CardContainer>
        ) : null
      )}
      {!displayedData && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}