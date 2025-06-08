import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select, Textarea } from './formStyles';

export default function PositionForm({ position, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: position?.name || '',
    departmentId: position?.department?.id || '',
    minSalary: position?.minSalary || '',
    maxSalary: position?.maxSalary || '',
    description: position?.description || '',
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);
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
        <Label htmlFor="name">Название должности</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="departmentId">Отдел</Label>
        <Select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
          <option value="">Выберите отдел</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="minSalary">Мин. зарплата</Label>
        <Input type="number" id="minSalary" name="minSalary" value={formData.minSalary} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="maxSalary">Макс. зарплата</Label>
        <Input type="number" id="maxSalary" name="maxSalary" value={formData.maxSalary} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}