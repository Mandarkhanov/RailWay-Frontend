import { useState } from 'react';
import styled from 'styled-components';
import { PageContainer, PageHeader, ActionButton } from './pageStyles';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-sql';
import * as api from '../services/api';
import QueryResultTable from '../components/QueryResultTable';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column; /* Изменено на колонку */
  gap: 2rem;
  flex-grow: 1;
`;

const EditorPanel = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

const EditorWrapper = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
  line-height: 1.5;
  background-color: #f4f6f8;
  color: #333;
  overflow: auto;
  min-height: 150px;
  max-height: 40vh;
  resize: vertical;
  position: relative;

  &:focus-within {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: slategray; }
  .token.operator, .token.punctuation { color: #999; }
  .token.keyword { color: #0077aa; font-weight: bold; }
  .token.function { color: #d859a9; }
  .token.string { color: #66a55c; }
  .token.number, .token.boolean, .token.constant, .token.symbol { color: #986801; }
`;

const ExecuteButton = styled(ActionButton)`
  margin-top: 1rem;
  align-self: flex-end;
  background-color: #2ecc71;
  color: white;
  border-color: #2ecc71;

  &:hover {
    background-color: #27ae60;
  }
`;

const PanelsWrapper = styled.div`
    display: flex;
    gap: 2rem;
    flex-grow: 1;
`;

const PresetPanel = styled.aside`
  flex: 1;
  background-color: transparent;
  padding-top: 1rem;
  max-height: 60vh;
  overflow-y: auto;
  
  h3 { margin-top: 0; margin-bottom: 1rem; color: #555; font-weight: 600; }
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
  &:hover { background-color: #e9ecef; border-color: #ccc; }
`;

const PRESET_QUERIES = [
    { id: 1, name: 'Работники по стажу > 5 лет', query: `SELECT first_name, last_name, hire_date, (CURRENT_DATE - hire_date) / 365 AS experience_years FROM employees WHERE (CURRENT_DATE - hire_date) / 365 > 5;` },
    { id: 2, name: 'Начальники отделов', query: `SELECT e.first_name, e.last_name, d.name as department_name FROM departments d JOIN employees e ON d.manager_id = e.employee_id;` },
    { id: 3, name: 'Работники в бригаде "Локомотивная бригада А"', query: `SELECT e.first_name, e.last_name, p.name as position FROM employees e JOIN employee_brigade eb ON e.employee_id = eb.employee_id JOIN brigades b ON eb.brigade_id = b.brigade_id JOIN positions p ON e.position_id = p.position_id WHERE b.name = 'Локомотивная бригада А';` },
    { id: 4, name: 'Машинисты, не прошедшие медосмотр в 2023г', query: `SELECT e.first_name, e.last_name, me.examination_date, me.notes FROM employees e JOIN medical_examinations me ON e.employee_id = me.employee_id JOIN positions p ON e.position_id = p.position_id WHERE p.name LIKE 'Машинист%' AND me.result = FALSE AND EXTRACT(YEAR FROM me.examination_date) = 2023;` },
    { id: 5, name: 'Поезда по кол-ву совершенных рейсов', query: `SELECT t.model, t.status, COUNT(s.schedule_id) AS trips_count FROM trains t LEFT JOIN schedules s ON t.train_id = s.train_id GROUP BY t.train_id, t.model, t.status ORDER BY trips_count DESC;` },
    { id: 6, name: 'Поезда, прошедшие плановый ТО за период', query: `SELECT DISTINCT t.model, m.type, m.start_date, m.result FROM trains t JOIN maintenance m ON t.train_id = m.train_id WHERE m.type = 'плановый' AND m.start_date BETWEEN '2023-10-01' AND '2023-10-31';` },
    { id: 7, name: 'Рейсы на маршруте "Москва - Санкт-Петербург"', query: `SELECT s.train_number, s.departure_time, s.arrival_time, s.base_price FROM schedules s JOIN routes r ON s.route_id = r.route_id WHERE r.name = 'Москва - Санкт-Петербург';` },
    { id: 8, name: 'Отмененные рейсы', query: `SELECT s.train_number, r.name as route_name, s.departure_time FROM schedules s JOIN routes r ON s.route_id = r.route_id WHERE s.train_status = 'отменен';` },
    { id: 9, name: 'Сданные билеты на задержанных рейсах', query: `SELECT s.train_number, r.name as route_name, COUNT(t.ticket_id) AS returned_tickets FROM tickets t JOIN schedules s ON t.schedule_id = s.schedule_id JOIN routes r ON s.route_id = r.route_id WHERE s.train_status = 'задержан' AND t.ticket_status = 'возвращен' GROUP BY s.train_number, r.name;` },
    { id: 10, name: 'Среднее кол-во билетов в день за ноябрь', query: `SELECT AVG(daily_sales) as average_tickets_per_day FROM (SELECT COUNT(ticket_id) as daily_sales FROM tickets WHERE purchase_date BETWEEN '2023-11-01' AND '2023-11-30' GROUP BY DATE(purchase_date)) as daily_counts;` },
    { id: 11, name: 'Маршруты категории "внутренний" в СПб', query: `SELECT r.name, st_start.name as start_station, st_end.name as end_station FROM routes r JOIN route_categories rc ON r.category_id = rc.category_id JOIN stations st_end ON r.end_station = st_end.station_id JOIN stations st_start ON r.start_station = st_start.station_id WHERE rc.name = 'внутренний' AND st_end.name = 'Санкт-Петербург Московский';` },
    { id: 12, name: 'Пассажиры на рейсе ID=1', query: `SELECT p.first_name, p.last_name, p.passport_number, t.ticket_status FROM passengers p JOIN tickets t ON p.passenger_id = t.passenger_id WHERE t.schedule_id = 1;` },
    { id: 13, name: 'Невыкупленные места на рейсе ID=1', query: `SELECT c.car_number, s.seat_number, s.seat_type FROM seats s JOIN cars c ON s.car_id = c.car_id JOIN schedules sch ON c.train_id = sch.train_id WHERE sch.schedule_id = 1 AND s.is_available = TRUE;` },
];


export default function SqlQueriesPage() {
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePresetClick = (query) => {
        setSqlQuery(query);
    };
  
    const handleExecute = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await api.executeSql(sqlQuery);
            if (response.error) {
                setError(response.error);
            } else {
                setResult(response);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer style={{ height: 'calc(100% - 4rem)', display: 'flex', flexDirection: 'column' }}>
        <PageHeader>
            <h2>SQL Консоль</h2>
        </PageHeader>
        <PanelsWrapper>
            <LayoutContainer>
                <EditorPanel>
                    <EditorWrapper>
                    <Editor
                        value={sqlQuery}
                        onValueChange={setSqlQuery}
                        highlight={code => highlight(code, languages.sql, 'sql')}
                        padding={0}
                        style={{ minHeight: '100%', fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: '1em' }}
                    />
                    </EditorWrapper>
                    <ExecuteButton onClick={handleExecute} disabled={isLoading}>
                    {isLoading ? 'Выполнение...' : 'Выполнить запрос'}
                    </ExecuteButton>
                </EditorPanel>
                <QueryResultTable result={result} error={error} isLoading={isLoading} />
            </LayoutContainer>
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
        </PanelsWrapper>
        </PageContainer>
    );
}