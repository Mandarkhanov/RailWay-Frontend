import { ClickableCard } from '../commonStyles';

export default function LuggageCard({ luggage, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>Багаж ID: {luggage.id}</h3>
      <p><strong>Вес:</strong> {luggage.weightKg} кг</p>
      <p><strong>Кол-во мест:</strong> {luggage.pieces}</p>
      <p><strong>Статус:</strong> {luggage.status}</p>
    </ClickableCard>
  );
}