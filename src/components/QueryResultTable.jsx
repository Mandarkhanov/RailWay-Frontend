import styled from 'styled-components';

const TableWrapper = styled.div`
  margin-top: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: auto;
  max-height: 50vh;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  
  th, td {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
  }

  th {
    background-color: #f7f9fa;
    font-weight: 600;
    color: #333;
    position: sticky;
    top: 0;
  }
  
  tr:nth-child(even) {
    background-color: #fcfcfc;
  }
  
  tr:hover {
    background-color: #f1f8ff;
  }
`;

const StatusMessage = styled.div`
  margin-top: 1.5rem;
  padding: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  
  &.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }
  
  &.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
    white-space: pre-wrap; /* Для переноса длинных ошибок */
  }
`;

export default function QueryResultTable({ result, error, isLoading }) {
  if (isLoading) return <StatusMessage>Выполнение запроса...</StatusMessage>;
  if (error) return <StatusMessage className="error">{error}</StatusMessage>;
  if (!result) return null;

  if (result.isUpdate) {
    return <StatusMessage className="success">Запрос выполнен. Затронуто строк: {result.updateCount}</StatusMessage>;
  }

  if (result.rows.length === 0) {
    return <StatusMessage>Запрос выполнен. Получено 0 строк.</StatusMessage>;
  }

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {result.columns.map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {result.columns.map(col => (
                <td key={`${rowIndex}-${col}`}>{JSON.stringify(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
}