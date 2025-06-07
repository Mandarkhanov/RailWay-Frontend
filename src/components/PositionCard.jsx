import { ClickableCard } from '../commonStyles';

export default function PositionCard({ position, onClick }) {
  const salaryText = `Зарплата: ${position.minSalary || 'N/A'} - ${position.maxSalary || 'N/A'} рублей`;
  
  return (
    <ClickableCard onClick={onClick}>
      <h3>{position.name}</h3>
      <p>{salaryText}</p>
      <p><strong>Описание:</strong> {position.description || 'Нет описания'}</p>
    </ClickableCard>
  );
}