import styled from 'styled-components';

export const PageContainer = styled.div`
  /* padding: 20px; - Этот отступ теперь в MainContent в AdminLayout.jsx */
  h2 {
    color: #333;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    margin-top: 0; /* Убираем верхний отступ у заголовка */
  }
`;

export const LoadingText = styled.p`
  font-style: italic;
  color: #555;
`;

export const ErrorText = styled.p`
  color: red;
  font-weight: bold;
`;

export const TopBarActions = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end; /* Выравнивание кнопок по правому краю */
  align-items: center;
`;

export const ActionButton = styled.button`
  margin-left: 10px; /* Отступ слева, т.к. кнопки справа */
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
`;

export const FilterItem = styled.div`
  color: black;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  label {
    margin-right: 10px;
    cursor: pointer;
    user-select: none;
  }

  input[type="checkbox"] {
    cursor: pointer;
  }
`;