import { ClickableCard } from '../commonStyles';
import styled from 'styled-components';

const StyledSeatCard = styled(ClickableCard)`
  background-color: ${props => props.$isAvailable ? '#f5f5f5' : '#e8f5e9'};
`;

export default function SeatCard({ seat, onClick }) {
  return (
    <StyledSeatCard onClick={onClick} $isAvailable={seat.isAvailable}>
      <h3>Место {seat.seatNumber}</h3>
      <p><strong>Вагон:</strong> {seat.car?.carNumber || 'N/A'} ({seat.car?.carType || 'N/A'})</p>
      <p><strong>Тип:</strong> {seat.seatType || 'N/A'}</p>
      <p><strong>Статус:</strong> {seat.isAvailable ? 'Свободно' : 'Выкуплено'}</p>
    </StyledSeatCard>
  );
}