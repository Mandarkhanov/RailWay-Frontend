import { ClickableCard } from '../commonStyles';

export default function TrainCard({ train, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'в порядке': return '#f0fff0'; // green
      case 'требует ремонта': return '#fffbe6'; // yellow
      case 'в ремонте': return '#fff0f0'; // red
      case 'списан': return '#f5f5f5'; // grey
      default: return '#fff';
    }
  };

  return (
    <ClickableCard onClick={onClick} style={{ backgroundColor: getStatusColor(train.status) }}>
      <h3>{train.model}</h3>
      <p><strong>Статус:</strong> {train.status}</p>
      <p><strong>Совершено рейсов:</strong> {train.tripsCount}</p>
      <p><strong>Всего ТО:</strong> {train.maintenanceCount}</p>
      <p><strong>Кол-во ремонтов:</strong> {train.repairCount}</p>
      <p><strong>Дата постройки:</strong> {train.buildDate ? new Date(train.buildDate).toLocaleDateString() : 'N/A'}</p>
    </ClickableCard>
  );
}