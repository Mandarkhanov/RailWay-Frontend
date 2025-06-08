import { useState, useMemo } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input, Select, FormHelperText } from './formStyles';

export default function EmployeeForm({ employee, positions = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
    positionId: employee?.position?.id || '',
    salary: employee?.salary || '',
    isActive: employee?.isActive !== undefined ? employee.isActive : true,
  });

  const selectedPosition = useMemo(() => {
    if (!formData.positionId) return null;
    return positions.find(p => p.id === parseInt(formData.positionId, 10));
  }, [formData.positionId, positions]);

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
        <Label htmlFor="firstName">Имя</Label>
        <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="lastName">Фамилия</Label>
        <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="hireDate">Дата найма</Label>
        <Input type="date" id="hireDate" name="hireDate" value={formData.hireDate} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="positionId">Должность</Label>
        <Select id="positionId" name="positionId" value={formData.positionId} onChange={handleChange} required>
          <option value="">Выберите должность</option>
          {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormGroup>
       <FormGroup>
        <Label htmlFor="salary">Зарплата</Label>
        <Input 
          type="number" 
          id="salary" 
          name="salary" 
          value={formData.salary} 
          onChange={handleChange}
          min={selectedPosition?.minSalary || 0}
          max={selectedPosition?.maxSalary || undefined}
          step="1000"
        />
        {selectedPosition && (selectedPosition.minSalary !== null || selectedPosition.maxSalary !== null) && (
            <FormHelperText>
                Диапазон для должности: {selectedPosition.minSalary ?? 'N/A'} - {selectedPosition.maxSalary ?? 'N/A'}
            </FormHelperText>
        )}
      </FormGroup>
       <FormGroup>
        <Label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
          Активен
        </Label>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}