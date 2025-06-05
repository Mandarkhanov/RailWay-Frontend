import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MedicalExaminationCard from '../components/MedicalExaminationsCard';


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


export default function MedicalExaminationsPage() {
  const [examinations, setExaminations] = useState(null);
  // Для "имен" медосмотров, можно показывать ID + ФИО сотрудника
  const [examinationSummaries, setExaminationSummaries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [showSummariesOnly, setShowSummariesOnly] = useState(false); // Изменено для ясности

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Для MedicalExaminations нет отдельного эндпоинта "names"
        // Будем всегда запрашивать полные данные, а summaries генерировать на клиенте
        const response = await fetch('http://localhost:8080/medical-examinations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExaminations(data);
        if (data) {
            const summaries = data.map(exam =>
                `Осмотр ID ${exam.id} для ${exam.employee ? exam.employee.firstName + ' ' + exam.employee.lastName : 'Неизвестный сотрудник'}`
            );
            setExaminationSummaries(summaries);
        }

      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch medical examinations:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Загрузка только один раз, т.к. summaries генерируем на клиенте


  if (loading) return <LoadingText>Загрузка медосмотров...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке медосмотров: {error}</ErrorText>;

  const displayedData = showSummariesOnly ? examinationSummaries : examinations;
  const dataForJson = showSummariesOnly ? (examinations || []) : examinations; // JSON всегда показывает полные данные

  return (
    <PageContainer>
      <h2>Медицинские осмотры</h2>
      <ButtonGroup>
        <button onClick={() => setViewMode('cards')} className={viewMode === 'cards' ? 'active' : ''}>Карточки</button>
        <button onClick={() => setViewMode('json')} className={viewMode === 'json' ? 'active' : ''}>JSON</button>
        <button onClick={() => setShowSummariesOnly(prev => !prev)}>
          {showSummariesOnly ? 'Показать все данные' : 'Показать только сводку'}
        </button>
      </ButtonGroup>

      {viewMode === 'json' && dataForJson && ( // Используем dataForJson для JSON вида
        <CodeBlock><code>{JSON.stringify(dataForJson, null, 2)}</code></CodeBlock>
      )}
      {viewMode === 'cards' && (
        showSummariesOnly && examinationSummaries ? (
          <NameList>
            {examinationSummaries.map((summary, index) => <li key={index}>{summary}</li>)}
          </NameList>
        ) : examinations ? (
          <CardContainer>
            {examinations.map(exam => <MedicalExaminationCard key={exam.id} exam={exam} />)}
          </CardContainer>
        ) : null
      )}
      {!displayedData && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}