import { ClickableCard } from '../commonStyles';

export default function RouteCard({ route, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{route.name}</h3>
      <p><strong>Направление:</strong> {route.startStation?.name} → {route.endStation?.name}</p>
      <p><strong>Категория:</strong> {route.category?.name || 'N/A'}</p>
    </ClickableCard>
  );
}