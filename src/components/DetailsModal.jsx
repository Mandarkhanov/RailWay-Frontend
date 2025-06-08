import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #ffffff; padding: 25px; border-radius: 8px;
  width: 70vw; max-width: 1100px; max-height: 90vh;
  display: flex; flex-direction: column; position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute; top: 10px; right: 15px; background: none; border: none;
  color: #333; font-size: 2.5rem; cursor: pointer; line-height: 1; padding: 0;
  &:hover { color: #000; }
`;

const ModalBody = styled.div`
  display: flex; flex-direction: row; gap: 30px;
  flex-grow: 1; margin-top: 20px; overflow-y: auto;
`;

const DetailsColumn = styled.div`
  flex: ${props => (props.$imageAspectRatio === '16:9' ? 1 : 2)};
  text-align: left; min-width: 0;
  h2 { margin-top: 0; color: #3498db; }
  p { line-height: 1.6; }
`;

const ImageColumn = styled.div`
  flex: 1; display: flex; justify-content: center;
  align-items: flex-start; min-width: 0;
`;

const Image = styled.img`
  width: 100%; height: auto; border-radius: 6px;
  background-color: #eee; object-fit: cover;
  aspect-ratio: ${props => (props.$aspectRatio === '16:9' ? '16 / 9' : '3 / 4')};
`;

export default function DetailsModal({ isOpen, onClose, imageSrc, imageAspectRatio = 'portrait', children, footer }) {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalBody>
          {/* Передаем transient prop */}
          <DetailsColumn $imageAspectRatio={imageAspectRatio}>{children}</DetailsColumn>
          {imageSrc && (
            <ImageColumn>
              {/* Передаем transient prop */}
              <Image src={imageSrc} alt="Details view" $aspectRatio={imageAspectRatio} />
            </ImageColumn>
          )}
        </ModalBody>
        {footer}
      </ModalContainer>
    </ModalBackdrop>
  );
}