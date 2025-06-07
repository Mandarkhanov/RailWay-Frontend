import { ClickableCard } from '../commonStyles';

export default function BrigadeCard({ brigade, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{brigade.name}</h3>
      <p><strong>Отдел:</strong> {brigade.department ? brigade.department.name : 'N/A'}</p>
      <p><strong>Менеджер:</strong> {brigade.manager ? `${brigade.manager.firstName} ${brigade.manager.lastName}` : 'N/A'}</p>
      {brigade.manager && brigade.manager.position && (
        <p><strong>Должность менеджера:</strong> {brigade.manager.position.name}</p>
      )}
    </ClickableCard>
  );
}