import { ClickableCard } from '../commonStyles';

export default function PassengerCard({ passenger, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{passenger.lastName} {passenger.firstName} {passenger.middleName || ''}</h3>
      <p><strong>Паспорт:</strong> {passenger.passportSeries} {passenger.passportNumber}</p>
      <p><strong>Email:</strong> {passenger.email || 'N/A'}</p>
    </ClickableCard>
  );
}