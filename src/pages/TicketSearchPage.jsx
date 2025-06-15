import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';

const SearchWrapper = styled.div`
  min-height: 400px;
  height: 100%;
  width: 100%;
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1591521783293-5cf3a23b3970?q=80&w=2070&auto=format&fit=crop) center/cover no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
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
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin: 0;
  text-align: center;
`;

const Highlight = styled.span`
  background-color: #e74c3c;
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
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #c0392b;
  }
`;

export default function TicketSearchPage() {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    api.getStations().then(data => setStations(data || [])).catch(console.error);
  }, []);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !departureDate) {
      alert('Пожалуйста, заполните поля "Откуда", "Куда" и дату отправления.');
      return;
    }
    const searchParams = { from, to, departureDate, returnDate };
    alert(`Поиск билетов: ${JSON.stringify(searchParams)} \n(интеграция с API не реализована)`);
  };

  const stationNamesDatalist = (
    <datalist id="stations-list">
      {stations.map(station => <option key={station.id} value={station.name} />)}
    </datalist>
  );

  return (
    <SearchWrapper>
      <SearchContent>
        <Title>
          <Highlight>КУПИТЬ БИЛЕТ,</Highlight> ПОСМОТРЕТЬ РАСПИСАНИЕ
        </Title>
        <SearchForm onSubmit={handleSubmit}>
          <InputWrapper>
            <Input type="text" placeholder="Откуда" value={from} onChange={e => setFrom(e.target.value)} list="stations-list" required />
          </InputWrapper>
          <SwapButton type="button" onClick={handleSwap}>⇄</SwapButton>
          <InputWrapper>
            <Input type="text" placeholder="Куда" value={to} onChange={e => setTo(e.target.value)} list="stations-list" required />
          </InputWrapper>
          <InputWrapper>
            <Input type="date" placeholder="Туда" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required />
          </InputWrapper>
          <InputWrapper>
            <Input type="date" placeholder="Обратно" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
          </InputWrapper>
          <FindButton type="submit">НАЙТИ</FindButton>
          {stationNamesDatalist}
        </SearchForm>
      </SearchContent>
    </SearchWrapper>
  );
}