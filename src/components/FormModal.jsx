import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1020;
`;

const ModalContainer = styled.div`
  background-color: white; padding: 25px; border-radius: 8px;
  width: 80vw; max-width: 600px; position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

const CloseButton = styled.button`
  position: absolute; top: 10px; right: 15px; background: none; border: none;
  color: #333; font-size: 2.5rem; cursor: pointer; line-height: 1; padding: 0;
  &:hover { color: #000; }
`;

const ModalTitle = styled.h2`
  margin-top: 0; color: #3498db;
`;

export default function FormModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>{title}</ModalTitle>
        {children}
      </ModalContainer>
    </ModalBackdrop>
  );
}