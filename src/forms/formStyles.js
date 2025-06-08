import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
`;

// Общие стили для полей ввода
const inputStyles = `
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  background-color: #fff; /* Явно задаем белый фон */
  color: #333; /* Явно задаем темный цвет текста */
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

export const Input = styled.input`
  ${inputStyles}
`;

export const Select = styled.select`
  ${inputStyles}
`;

export const Textarea = styled.textarea`
  ${inputStyles}
  min-height: 80px;
  resize: vertical;
`;

// Новый компонент для подсказок и ошибок
export const FormHelperText = styled.small`
    margin-top: 5px;
    color: #777;
    font-style: italic;
`;