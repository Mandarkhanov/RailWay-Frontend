import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select, Textarea } from './formStyles';

const seatTypes = ['нижнее', 'верхнее', 'боковое нижнее', 'боковое верхнее', 'у окна', 'у прохода'];

export default function SeatForm({ seat, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    carId: seat?.car?.id || '',
    seatNumber: seat?.seatNumber || '',
    seatType: seat?.seatType || 'нижнее',
    isAvailable: seat?.isAvailable !== undefined ? seat.isAvailable : true,
    features: seat?.features || '',
  });
  const [cars, setCars] = useState([]);

  useEffect(() => {
    api.getCars().then(setCars).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        <Label htmlFor="carId">Вагон</Label>
        <Select id="carId" name="carId" value={formData.carId} onChange={handleChange} required>
          <option value="">Выберите вагон</option>
          {cars.map(c => <option key={c.id} value={c.id}>№{c.carNumber} ({c.carType})</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="seatNumber">Номер места</Label>
        <Input type="text" id="seatNumber" name="seatNumber" value={formData.seatNumber} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="seatType">Тип места</Label>
        <Select id="seatType" name="seatType" value={formData.seatType} onChange={handleChange}>
          {seatTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
          Доступно
        </Label>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="features">Особенности</Label>
        <Textarea id="features" name="features" value={formData.features} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}