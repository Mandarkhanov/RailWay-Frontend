import { ClickableCard } from '../commonStyles';

export default function CarCard({ car, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>Вагон №{car.carNumber}</h3>
      <p><strong>Тип:</strong> {car.carType || 'N/A'}</p>
      <p><strong>Статус:</strong> {car.status || 'N/A'}</p>
      <p><strong>Вместимость:</strong> {car.capacity !== null ? car.capacity : 'N/A'}</p>
    </ClickableCard>
  );
}