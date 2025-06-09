import styled from 'styled-components';

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;

  h2 {
    margin: 0;
    padding: 0;
    border: none;
  }
`;

export const PageContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ActionButton = styled.button`
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