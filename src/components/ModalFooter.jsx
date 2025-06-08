import styled from 'styled-components';

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
  
  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3498db;
  color: white;
  &:hover { background-color: #2980b9; }
`;

const DangerButton = styled(Button)`
  background-color: #e74c3c;
  color: white;
  &:hover { background-color: #c0392b; }
`;

const SecondaryButton = styled(Button)`
  background-color: #bdc3c7;
  color: #333;
  &:hover { background-color: #95a5a6; }
`;

export default function ModalFooter({ actions }) {
  const getButtonComponent = (type) => {
    switch (type) {
      case 'primary': return PrimaryButton;
      case 'danger': return DangerButton;
      case 'secondary': return SecondaryButton;
      default: return Button;
    }
  };

  return (
    <FooterContainer>
      {actions.map((action, index) => {
        const ButtonComponent = getButtonComponent(action.type);
        return (
          <ButtonComponent key={index} onClick={action.onClick}>
            {action.label}
          </ButtonComponent>
        );
      })}
    </FooterContainer>
  );
}