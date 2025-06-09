import { ClickableCard } from '../commonStyles';

export default function RouteStopCard({ routeStop, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{routeStop.route?.name}</h3>
      <p><strong>Остановка:</strong> {routeStop.station?.name} (№{routeStop.stopOrder})</p>
      <p><strong>Прибытие/отправление:</strong> {routeStop.arrivalOffset ?? 'N/A'} / {routeStop.departureOffset ?? 'N/A'} мин.</p>
    </ClickableCard>
  );
}