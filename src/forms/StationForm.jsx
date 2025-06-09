import { useState } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input } from './formStyles';

export default function StationForm({ station, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: station?.name || '',
    address: station?.address || '',
    region: station?.region || '',
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
        <Label htmlFor="name">Название станции</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="region">Регион</Label>
        <Input type="text" id="region" name="region" value={formData.region} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="address">Адрес</Label>
        <Input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}