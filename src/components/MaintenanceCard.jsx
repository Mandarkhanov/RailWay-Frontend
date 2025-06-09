import { ClickableCard } from '../commonStyles';

export default function MaintenanceCard({ maintenance, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>ТО: {maintenance.train?.model || 'N/A'}</h3>
      <p><strong>Тип:</strong> {maintenance.type}</p>
      <p><strong>Дата начала:</strong> {new Date(maintenance.startDate).toLocaleString()}</p>
      <p><strong>Статус:</strong> {maintenance.endDate ? 'Завершено' : 'В процессе'}</p>
    </ClickableCard>
  );
}