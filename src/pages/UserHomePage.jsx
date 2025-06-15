import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';
import ScheduleCard from '../components/ScheduleCard';
import { CardContainer } from '../commonStyles';
import { LoadingText, ErrorText } from './pageStyles';
import PurchaseTicketModal from '../components/PurchaseTicketModal';

const HomePageContainer = styled.div`
    padding: 2rem;
`;

const SearchWrapper = styled.div`
  min-height: 350px;
  width: 100%;
  border-radius: 16px;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(44, 62, 80, 0.2);
`;

const SearchContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
`;

const Title = styled.h1`
  font-size: 2em;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  margin: 0;
  text-align: center;
`;

const Highlight = styled.span`
  background-color: rgba(255, 255, 255, 0.15);
  padding: 0.2em 0.6em;
  border-radius: 4px;
`;

const SearchForm = styled.form`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 30px;
    background-color: #e0e0e0;
  }
`;

const Input = styled.input`
  width: 100%;
  border: none;
  outline: none;
  padding: 15px;
  font-size: 1em;
  color: #333;
  background-color: transparent;
  
  &::placeholder {
    color: #888;
  }
`;

const SwapButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  color: #888;
  padding: 0 10px;
  transition: color 0.2s;
  
  &:hover {
    color: #3498db;
  }
`;

const FindButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ResultsContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
`;

const NoResultsText = styled.p`
    text-align: center;
    color: #888;
    padding: 2rem 0;
`;

export default function UserHomePage() {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    api.getStations().then(data => setStations(data || [])).catch(console.error);
  }, []);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) {
      alert('Пожалуйста, заполните поля "Откуда" и "Куда".');
      return;
    }

    setSearchAttempted(true);
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    api.findSchedules(from, to)
        .then(data => setSearchResults(data))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
  };

  const handlePurchaseClick = (schedule) => {
    setSelectedSchedule(schedule);
    setPurchaseModalOpen(true);
  };

  const stationNamesDatalist = (
    <datalist id="stations-list">
      {stations.map(station => <option key={station.id} value={station.name} />)}
    </datalist>
  );

  return (
    <HomePageContainer>
        <SearchWrapper>
            <SearchContent>
                <Title>
                <Highlight>КУПИТЬ БИЛЕТ</Highlight> ИЛИ <Highlight>ПОСМОТРЕТЬ РАСПИСАНИЕ</Highlight>
                </Title>
                <SearchForm onSubmit={handleSearchSubmit}>
                    <InputWrapper>
                        <Input type="text" placeholder="Откуда" value={from} onChange={e => setFrom(e.target.value)} list="stations-list" required />
                    </InputWrapper>
                    <SwapButton type="button" onClick={handleSwap}>⇄</SwapButton>
                    <InputWrapper>
                        <Input type="text" placeholder="Куда" value={to} onChange={e => setTo(e.target.value)} list="stations-list" required />
                    </InputWrapper>
                    <InputWrapper>
                        <Input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                    </InputWrapper>
                    <InputWrapper>
                        <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                    </InputWrapper>
                    <FindButton type="submit">НАЙТИ</FindButton>
                    {stationNamesDatalist}
                </SearchForm>
            </SearchContent>
        </SearchWrapper>
        
        {searchAttempted && (
            <ResultsContainer>
                <h2>Результаты поиска</h2>
                {isLoading && <LoadingText>Идет поиск рейсов...</LoadingText>}
                {error && <ErrorText>Ошибка: {error}</ErrorText>}
                {!isLoading && !error && searchResults.length === 0 && (
                    <NoResultsText>Рейсы по вашему запросу не найдены.</NoResultsText>
                )}
                {!isLoading && searchResults.length > 0 && (
                    <CardContainer>
                        {searchResults.map(schedule => (
                            <ScheduleCard key={schedule.id} schedule={schedule} onClick={() => handlePurchaseClick(schedule)} />
                        ))}
                    </CardContainer>
                )}
            </ResultsContainer>
        )}
        
        {selectedSchedule && (
            <PurchaseTicketModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                schedule={selectedSchedule}
            />
        )}
    </HomePageContainer>
  );
}