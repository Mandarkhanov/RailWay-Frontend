import { ClickableCard } from '../commonStyles';

export default function SeatCard({ seat, onClick }) {
  return (
    <ClickableCard onClick={onClick} $isSuccess={seat.isAvailable}>
      <h3>Место {seat.seatNumber}</h3>
      <p><strong>Вагон:</strong> {seat.car?.carNumber || 'N/A'}</p>
      <p><strong>Тип:</strong> {seat.seatType || 'N/A'}</p>
      <p><strong>Статус:</strong> {seat.isAvailable ? 'Доступно' : 'Занято'}</p>
    </ClickableCard>
  );
}