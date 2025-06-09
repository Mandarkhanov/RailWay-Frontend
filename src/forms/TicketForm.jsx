import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function TicketForm({ ticket, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    scheduleId: ticket?.schedule?.id || '',
    passengerId: ticket?.passenger?.id || '',
    seatId: ticket?.seat?.id || '',
    luggageId: ticket?.luggage?.id || '',
    price: ticket?.price || '',
    ticketStatus: ticket?.ticketStatus || 'оплачен',
  });

  const [schedules, setSchedules] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [seats, setSeats] = useState([]);
  const [luggages, setLuggages] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getSchedules(),
      api.getPassengers(),
      api.getSeats(),
      api.getLuggage()
    ]).then(([schedulesData, passengersData, seatsData, luggageData]) => {
      setSchedules(schedulesData);
      setPassengers(passengersData);
      setSeats(seatsData);
      setLuggages(luggageData);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...formData, luggageId: formData.luggageId || null });
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
      <FormGroup>
        <Label htmlFor="scheduleId">Рейс</Label>
        <Select id="scheduleId" name="scheduleId" value={formData.scheduleId} onChange={handleChange} required>
          <option value="">Выберите рейс</option>
          {schedules.map(s => <option key={s.id} value={s.id}>№{s.trainNumber} - {s.route?.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="passengerId">Пассажир</Label>
        <Select id="passengerId" name="passengerId" value={formData.passengerId} onChange={handleChange} required>
          <option value="">Выберите пассажира</option>
          {passengers.map(p => <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="seatId">Место</Label>
        <Select id="seatId" name="seatId" value={formData.seatId} onChange={handleChange} required>
          <option value="">Выберите место</option>
          {seats.map(s => <option key={s.id} value={s.id}>Вагон {s.car.carNumber}, место {s.seatNumber}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="luggageId">Багаж</Label>
        <Select id="luggageId" name="luggageId" value={formData.luggageId} onChange={handleChange}>
          <option value="">Без багажа</option>
          {luggages.map(l => <option key={l.id} value={l.id}>ID {l.id} ({l.weightKg} кг)</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="price">Цена</Label>
        <Input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="ticketStatus">Статус билета</Label>
        <Select id="ticketStatus" name="ticketStatus" value={formData.ticketStatus} onChange={handleChange}>
          <option value="забронирован">Забронирован</option>
          <option value="оплачен">Оплачен</option>
          <option value="возвращен">Возвращен</option>
          <option value="использован">Использован</option>
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}