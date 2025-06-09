import { ClickableCard } from '../commonStyles';

export default function TicketCard({ ticket, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>Билет ID: {ticket.id}</h3>
      <p><strong>Пассажир:</strong> {ticket.passenger?.lastName} {ticket.passenger?.firstName}</p>
      <p><strong>Рейс:</strong> №{ticket.schedule?.trainNumber} ({ticket.schedule?.route?.name})</p>
      <p><strong>Статус:</strong> {ticket.ticketStatus}</p>
    </ClickableCard>
  );
}