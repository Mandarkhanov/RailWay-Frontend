import { ClickableCard } from '../commonStyles';

export default function ScheduleCard({ schedule, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>Рейс №{schedule.trainNumber}</h3>
      <p><strong>Маршрут:</strong> {schedule.route?.name || 'N/A'}</p>
      <p><strong>Отправление:</strong> {new Date(schedule.departureTime).toLocaleString()}</p>
      <p><strong>Статус:</strong> {schedule.trainStatus}</p>
    </ClickableCard>
  );
}