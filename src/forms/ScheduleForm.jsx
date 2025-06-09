import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

const formatDateTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

export default function ScheduleForm({ schedule, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    trainId: schedule?.train?.id || '',
    trainNumber: schedule?.trainNumber || '',
    typeId: schedule?.type?.id || '',
    trainStatus: schedule?.trainStatus || 'по расписанию',
    routeId: schedule?.route?.id || '',
    departureTime: formatDateTimeForInput(schedule?.departureTime),
    arrivalTime: formatDateTimeForInput(schedule?.arrivalTime),
    basePrice: schedule?.basePrice || '',
  });

  const [trains, setTrains] = useState([]);
  const [trainTypes, setTrainTypes] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getTrains(),
      api.getTrainTypes(),
      api.getRoutes()
    ]).then(([trainsData, typesData, routesData]) => {
      setTrains(trainsData);
      setTrainTypes(typesData);
      setRoutes(routesData);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
        <FormGroup>
            <Label htmlFor="trainNumber">Номер поезда</Label>
            <Input type="text" id="trainNumber" name="trainNumber" value={formData.trainNumber} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
            <Label htmlFor="trainId">Поезд (модель)</Label>
            <Select id="trainId" name="trainId" value={formData.trainId} onChange={handleChange}>
                <option value="">Выберите поезд</option>
                {trains.map(t => <option key={t.id} value={t.id}>{t.model}</option>)}
            </Select>
        </FormGroup>
        <FormGroup>
            <Label htmlFor="typeId">Тип поезда</Label>
            <Select id="typeId" name="typeId" value={formData.typeId} onChange={handleChange}>
                <option value="">Выберите тип</option>
                {trainTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
        </FormGroup>
        <FormGroup>
            <Label htmlFor="routeId">Маршрут</Label>
            <Select id="routeId" name="routeId" value={formData.routeId} onChange={handleChange}>
                <option value="">Выберите маршрут</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
        </FormGroup>
        <FormGroup>
            <Label htmlFor="departureTime">Время отправления</Label>
            <Input type="datetime-local" id="departureTime" name="departureTime" value={formData.departureTime} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
            <Label htmlFor="arrivalTime">Время прибытия</Label>
            <Input type="datetime-local" id="arrivalTime" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
            <Label htmlFor="basePrice">Базовая цена</Label>
            <Input type="number" id="basePrice" name="basePrice" value={formData.basePrice} onChange={handleChange} required step="0.01" />
        </FormGroup>
        <FormGroup>
            <Label htmlFor="trainStatus">Статус рейса</Label>
            <Select id="trainStatus" name="trainStatus" value={formData.trainStatus} onChange={handleChange}>
                <option value="по расписанию">По расписанию</option>
                <option value="задержан">Задержан</option>
                <option value="отменен">Отменен</option>
                <option value="выполнен">Выполнен</option>
                <option value="в пути">В пути</option>
            </Select>
        </FormGroup>
        <ModalFooter actions={actions} />
    </Form>
  );
}