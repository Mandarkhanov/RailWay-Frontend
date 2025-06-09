import { ClickableCard } from '../commonStyles';

export default function StationCard({ station, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{station.name}</h3>
      <p><strong>Регион:</strong> {station.region || 'N/A'}</p>
      <p><strong>Адрес:</strong> {station.address || 'N/A'}</p>
    </ClickableCard>
  );
}