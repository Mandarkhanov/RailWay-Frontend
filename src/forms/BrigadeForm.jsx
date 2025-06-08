import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function BrigadeForm({ brigade, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: brigade?.name || '',
    departmentId: brigade?.department?.id || null,
    managerId: brigade?.manager?.id || null,
  });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);
    api.getEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Для <select> пустая строка означает null
    const finalValue = value === '' ? null : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
        <Label htmlFor="name">Название бригады</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="departmentId">Отдел</Label>
        <Select id="departmentId" name="departmentId" value={formData.departmentId || ''} onChange={handleChange}>
          <option value="">Без отдела</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="managerId">Менеджер</Label>
        <Select id="managerId" name="managerId" value={formData.managerId || ''} onChange={handleChange}>
          <option value="">Без менеджера</option>
          {employees.map(e => <option key={e.id} value={e.id}>{`${e.firstName} ${e.lastName}`}</option>)}
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}