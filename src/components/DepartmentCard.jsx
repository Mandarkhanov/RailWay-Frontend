import { ClickableCard } from '../commonStyles';

export default function DepartmentCard({ department, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{department.name}</h3>
      <p>{department.description || 'Нет описания'}</p>
    </ClickableCard>
  );
}