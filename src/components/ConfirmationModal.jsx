import styled from 'styled-components';
import ModalFooter from './ModalFooter';

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1050;
`;

const ModalContainer = styled.div`
  background-color: white; padding: 20px; border-radius: 8px;
  width: 90vw; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

const ModalTitle = styled.h3`
  margin-top: 0;
`;

const ModalMessage = styled.p`
  color: #555;
`;

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  const actions = [
    { label: 'Отмена', onClick: onClose, type: 'secondary' },
    { label: 'Подтвердить', onClick: onConfirm, type: 'danger' },
  ];

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ModalFooter actions={actions} />
      </ModalContainer>
    </ModalBackdrop>
  );
}