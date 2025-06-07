import { useState } from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #282c34;
  color: #abb2bf;
  padding: 20px;
  border-radius: 8px;
  width: 80vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
`;

const CopyButton = styled.button`
  background-color: #4a6279;
  color: white;
  border: 1px solid #5f7e9c;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9em;

  &:hover {
    background-color: #5f7e9c;
  }
`;

const CopyConfirmation = styled.span`
  color: #4CAF50; /* Зеленый цвет для подтверждения */
  margin: 0 15px;
  font-style: italic;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => (props.show ? 1 : 0)};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  
  &:hover {
    color: #ccc;
  }
`;

const CodeBlock = styled.pre`
  flex-grow: 1;
  padding: 15px;
  overflow: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  background-color: #1e1e1e; /* Чуть темнее фон для самого кода */
  border-radius: 5px;
  text-align: left;
`;

export default function JsonModal({ isOpen, onClose, children }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    // navigator.clipboard.writeText() возвращает Promise
    navigator.clipboard.writeText(children).then(
      () => {
        // Показываем сообщение об успехе
        setIsCopied(true);
        // Через 2 секунды скрываем его
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      },
      (err) => {
        // На случай, если копирование не удалось (например, из-за настроек браузера)
        console.error('Ошибка: не удалось скопировать текст: ', err);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <CopyButton onClick={handleCopy}>Копировать</CopyButton>
          <CopyConfirmation show={isCopied}>Скопировано!</CopyConfirmation>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <CodeBlock>
          <code>{children}</code>
        </CodeBlock>
      </ModalContent>
    </ModalBackdrop>
  );
}