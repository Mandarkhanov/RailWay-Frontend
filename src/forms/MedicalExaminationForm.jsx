import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select, Textarea } from './formStyles';

export default function MedicalExaminationForm({ exam, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employeeId: exam?.employee?.id || '',
    examinationDate: exam?.examinationDate || '',
    result: exam?.result !== undefined ? exam.result : true,
    notes: exam?.notes || '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.getEmployees().then(setEmployees).catch(console.error);
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
        <Label htmlFor="employeeId">Сотрудник</Label>
        <Select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required>
          <option value="">Выберите сотрудника</option>
          {employees.map(e => <option key={e.id} value={e.id}>{`${e.firstName} ${e.lastName}`}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="examinationDate">Дата осмотра</Label>
        <Input type="date" id="examinationDate" name="examinationDate" value={formData.examinationDate} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label>
          <input type="checkbox" name="result" checked={formData.result} onChange={handleChange} />
          Годен
        </Label>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="notes">Заметки</Label>
        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}