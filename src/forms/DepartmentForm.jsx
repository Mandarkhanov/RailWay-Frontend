import { useState } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input, Textarea } from './formStyles';

export default function DepartmentForm({ department, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
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
        <Label htmlFor="name">Название отдела</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}