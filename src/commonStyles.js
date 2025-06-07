import styled from 'styled-components';

const getCardBackground = (props) => {
  // Исправленная проверка: теперь она сработает и для boolean `false`, и для строки "false"
  if (props.isActive === false || props.isActive === 'false') {
    return '#fff0f0'; // Светло-красный для неактивных сотрудников
  }
  if (props.isSuccess === true) {
    return '#f0fff0'; // Светло-зеленый для "годен"
  }
  if (props.isSuccess === false) {
    return '#fff0f0'; // Светло-красный для "не годен"
  }
  return '#fff'; // По умолчанию
};

export const Card = styled.div`
  background-color: ${props => getCardBackground(props)};
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: auto; 
  display: flex;
  flex-direction: column;
  text-align: left;
  h3 {
    margin-top: 0;
    color: #3498db;
    font-size: 1.2em;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  p {
    margin: 4px 0;
    line-height: 1.4;
    font-size: 0.9em;
    color: #555;
  }
  strong {
    color: #333;
  }
`;

// Новый экспортируемый компонент для карточек, по которым можно кликнуть
export const ClickableCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
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