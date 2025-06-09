import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function CarForm({ car, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    carNumber: car?.carNumber || '',
    trainId: car?.train?.id || '',
    carType: car?.carType || 'плацкарт',
    capacity: car?.capacity || '',
    buildDate: car?.buildDate || '',
    status: car?.status || 'в эксплуатации',
  });
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    api.getTrains().then(setTrains).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...formData, capacity: formData.capacity ? parseInt(formData.capacity, 10) : null });
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
      <FormGroup>
        <Label htmlFor="carNumber">Номер вагона</Label>
        <Input type="text" id="carNumber" name="carNumber" value={formData.carNumber} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="carType">Тип вагона</Label>
        <Select id="carType" name="carType" value={formData.carType} onChange={handleChange}>
          <option value="плацкарт">Плацкарт</option>
          <option value="купе">Купе</option>
          <option value="спальный">Спальный</option>
          <option value="сидячий">Сидячий</option>
          <option value="ресторан">Ресторан</option>
          <option value="багажный">Багажный</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="trainId">Поезд</Label>
        <Select id="trainId" name="trainId" value={formData.trainId} onChange={handleChange}>
          <option value="">Без поезда</option>
          {trains.map(t => <option key={t.id} value={t.id}>{t.model}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="capacity">Вместимость</Label>
        <Input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="buildDate">Дата постройки</Label>
        <Input type="date" id="buildDate" name="buildDate" value={formData.buildDate} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="status">Статус</Label>
        <Select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="в эксплуатации">В эксплуатации</option>
          <option value="в ремонте">В ремонте</option>
          <option value="списан">Списан</option>
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}