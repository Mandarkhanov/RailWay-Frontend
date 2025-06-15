import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';
import TicketCard from '../components/TicketCard';
import { CardContainer } from '../commonStyles';
import { LoadingText, ErrorText } from './pageStyles';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const TicketsListContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  
  h2 {
      margin-top: 0;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
  }
`;

const NoTicketsPlaceholder = styled.div`
  padding: 2rem;
  text-align: center;
  color: #888;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function UserTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getMyTickets()
            .then(data => {
                setTickets(data);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingText>Загрузка ваших билетов...</LoadingText>;
        }
        if (error) {
            return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;
        }
        if (tickets.length === 0) {
            return (
                <NoTicketsPlaceholder>
                    У вас пока нет купленных билетов.
                </NoTicketsPlaceholder>
            );
        }
        return (
            <CardContainer>
                {tickets.map(ticket => (
                    <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        onClick={() => alert(`Детали билета ID: ${ticket.id}`)}
                    />
                ))}
            </CardContainer>
        );
    }

    return (
        <PageWrapper>
            <TicketsListContainer>
                <h2>Мои билеты</h2>
                {renderContent()}
            </TicketsListContainer>
        </PageWrapper>
    );
}