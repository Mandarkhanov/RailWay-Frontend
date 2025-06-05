import styled from 'styled-components';

export const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 300px; /* Примерная ширина, можно адаптировать */
  display: flex;
  flex-direction: column;
  h3 {
    margin-top: 0;
    color: #3498db;
    font-size: 1.2em;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  p {
    margin: 5px 0;
    line-height: 1.4;
    font-size: 0.9em;
    color: #555;
  }
  strong {
    color: #333;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Карточки будут слева */
  gap: 10px; /* Пространство между карточками */
`;

export const ButtonGroup = styled.div`
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

export const NameList = styled.ul`
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