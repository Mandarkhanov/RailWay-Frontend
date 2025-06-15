import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Textarea, Select } from './formStyles';

export default function DepartmentForm({ department, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    managerId: department?.manager?.id || '',
  });
  
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.getEmployees().then(setEmployees).catch(console.error);
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
        <Label htmlFor="name">Название отдела</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="managerId">Менеджер</Label>
        <Select id="managerId" name="managerId" value={formData.managerId} onChange={handleChange}>
          <option value="">Без менеджера</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}