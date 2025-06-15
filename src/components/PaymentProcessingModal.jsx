import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ModalFooter from './ModalFooter';

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1070;
`;

const ModalContainer = styled.div`
  background-color: white; padding: 30px; border-radius: 8px;
  width: 90vw; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  text-align: center;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
  margin: 20px auto;
`;

const StatusTitle = styled.h3`
  margin-top: 0;
  color: ${props => props.color || '#333'};
`;

const StatusMessage = styled.p`
  color: #555;
  min-height: 2em;
`;

export default function PaymentProcessingModal({ isOpen, onConfirmPurchase, onCloseAll }) {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('processing');
      setErrorMessage('');
      
      const timer = setTimeout(async () => {
        try {
          await onConfirmPurchase();
          setStatus('success');
        } catch (err) {
          setErrorMessage(err.message || 'Произошла неизвестная ошибка.');
          setStatus('error');
        }
      }, 2500); // Имитация задержки на 2.5 секунды

      return () => clearTimeout(timer);
    }
  }, [isOpen, onConfirmPurchase]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <StatusTitle>Обработка платежа</StatusTitle>
            <Spinner />
            <StatusMessage>Пожалуйста, подождите, мы связываемся с банком...</StatusMessage>
          </>
        );
      case 'success':
        return (
          <>
            <StatusTitle color="#2ecc71">Оплата прошла успешно!</StatusTitle>
            <StatusMessage>Ваш билет куплен. Спасибо за покупку!</StatusMessage>
            <ModalFooter actions={[{ label: 'Отлично!', onClick: onCloseAll, type: 'primary' }]} />
          </>
        );
      case 'error':
        return (
          <>
            <StatusTitle color="#e74c3c">Ошибка оплаты</StatusTitle>
            <StatusMessage>{errorMessage}</StatusMessage>
            <ModalFooter actions={[{ label: 'Попробовать снова', onClick: onCloseAll, type: 'secondary' }]} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ModalBackdrop>
      <ModalContainer>
        {renderContent()}
      </ModalContainer>
    </ModalBackdrop>
  );
}