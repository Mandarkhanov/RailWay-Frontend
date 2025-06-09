import { useState } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function LuggageForm({ luggage, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    weightKg: luggage?.weightKg || '',
    pieces: luggage?.pieces || '',
    status: luggage?.status || 'зарегистрирован',
  });

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
        <Label htmlFor="weightKg">Вес (кг)</Label>
        <Input type="number" id="weightKg" name="weightKg" value={formData.weightKg} onChange={handleChange} step="0.1" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="pieces">Количество мест</Label>
        <Input type="number" id="pieces" name="pieces" value={formData.pieces} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="status">Статус</Label>
        <Select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="зарегистрирован">Зарегистрирован</option>
          <option value="в пути">В пути</option>
          <option value="выдан">Выдан</option>
          <option value="потерян">Потерян</option>
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}