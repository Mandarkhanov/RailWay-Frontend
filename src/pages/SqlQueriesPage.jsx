import { useState } from 'react';
import styled from 'styled-components';
import { PageContainer, PageHeader, ActionButton } from './pageStyles';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-sql';

const LayoutContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-grow: 1
`;

const EditorPanel = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const EditorWrapper = styled.div`
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
  line-height: 1.5;
  background-color: #f4f6f8;
  color: #333;
  overflow: auto;
  position: relative;

  &:focus-within {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  /* Тема для подсветки синтаксиса SQL */
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: slategray;
  }
  .token.operator,
  .token.punctuation {
    color: #999;
  }
  .token.keyword {
    color: #0077aa;
    font-weight: bold;
  }
  .token.function {
    color: #d859a9;
  }
  .token.string {
    color: #66a55c;
  }
  .token.number,
  .token.boolean,
  .token.constant,
  .token.symbol {
    color: #986801;
  }
`;

const ExecuteButton = styled(ActionButton)`
  margin-top: 1rem;
  align-self: flex-end;
  background-color: #3498db;
  color: white;

  &:hover {
    background-color: #2980b9;
  }
`;

const PresetPanel = styled.aside`
  flex: 1;
  background-color: transparent;
  padding: 1rem;
  border-radius: 8px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #555;
    font-weight: 600;
  }
`;

const PresetList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const PresetItem = styled.button`
  width: 100%;
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
  padding: 10px 15px;
  margin-bottom: 8px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.9em;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s;

  &:hover {
    background-color: #e9ecef;
    border-color: #ccc;
  }
`;

const PRESET_QUERIES = [
  {
    id: 1,
    name: 'Все сотрудники',
    query: 'SELECT * FROM employees;',
  },
  {
    id: 2,
    name: 'Сотрудники и их должности',
    query: `SELECT e.first_name, e.last_name, p.name AS position_name
            FROM employees e
            JOIN positions p ON e.position_id = p.id;`,
  },
  {
    id: 3,
    name: 'Отделы с > 5 сотрудниками',
    query: `SELECT d.name, COUNT(e.id) AS employee_count
            FROM departments d
            JOIN positions p ON d.id = p.department_id
            JOIN employees e ON p.id = e.position_id
            GROUP BY d.name
            HAVING COUNT(e.id) > 5;`,
  },
  {
    id: 4,
    name: 'Не прошедшие медосмотр',
    query: `SELECT e.first_name, e.last_name, me.examination_date, me.notes
            FROM medical_examinations me
            JOIN employees e ON me.employee_id = e.id
            WHERE me.result = false;`
  }
];

export default function SqlQueriesPage() {
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');

  const handlePresetClick = (query) => {
    setSqlQuery(query);
  };
  
  const handleExecute = () => {
    alert("Выполнение запроса...\n(Функционал пока не реализован на бэкенде)");
  };

  return (
    <PageContainer style={{ height: 'calc(100% - 4rem)' }}>
      <PageHeader>
        <h2>SQL Запросы</h2>
      </PageHeader>
      <LayoutContainer>
        <EditorPanel>
          <EditorWrapper>
            <Editor
              value={sqlQuery}
              onValueChange={setSqlQuery}
              highlight={code => highlight(code, languages.sql, 'sql')}
              padding={0}
              style={{
                minHeight: '100%',
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: '1em',
                lineHeight: 1.5,
                background: 'transparent',
                caretColor: '#333',
                border: 0,
                outline: 0,
              }}
            />
          </EditorWrapper>
          <ExecuteButton onClick={handleExecute}>Выполнить запрос</ExecuteButton>
        </EditorPanel>
        <PresetPanel>
          <h3>Готовые запросы</h3>
          <PresetList>
            {PRESET_QUERIES.map(q => (
              <li key={q.id}>
                <PresetItem onClick={() => handlePresetClick(q.query)}>
                  {q.id}. {q.name}
                </PresetItem>
              </li>
            ))}
          </PresetList>
        </PresetPanel>
      </LayoutContainer>
    </PageContainer>
  );
}