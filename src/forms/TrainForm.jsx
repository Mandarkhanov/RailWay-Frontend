import { useState } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function TrainForm({ train, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    model: train?.model || '',
    buildDate: train?.buildDate || '',
    lastMaintenanceDate: train?.lastMaintenanceDate || '',
    status: train?.status || 'в порядке',
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
        <Label htmlFor="model">Модель поезда</Label>
        <Input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="buildDate">Дата постройки</Label>
        <Input type="date" id="buildDate" name="buildDate" value={formData.buildDate} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="lastMaintenanceDate">Дата последнего ТО</Label>
        <Input type="date" id="lastMaintenanceDate" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="status">Статус</Label>
        <Select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="в порядке">В порядке</option>
          <option value="требует ремонта">Требует ремонта</option>
          <option value="в ремонте">В ремонте</option>
          <option value="списан">Списан</option>
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}