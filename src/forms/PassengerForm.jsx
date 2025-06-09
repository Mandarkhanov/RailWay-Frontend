import { useState } from 'react';
import ModalFooter from '../components/ModalFooter';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function PassengerForm({ passenger, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: passenger?.firstName || '',
    lastName: passenger?.lastName || '',
    middleName: passenger?.middleName || '',
    birthDate: passenger?.birthDate || '',
    gender: passenger?.gender || 'М',
    passportSeries: passenger?.passportSeries || '',
    passportNumber: passenger?.passportNumber || '',
    phoneNumber: passenger?.phoneNumber || '',
    email: passenger?.email || '',
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
        <Label htmlFor="lastName">Фамилия</Label>
        <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="firstName">Имя</Label>
        <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="middleName">Отчество</Label>
        <Input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="birthDate">Дата рождения</Label>
        <Input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="gender">Пол</Label>
        <Select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
          <option value="М">Мужской</option>
          <option value="Ж">Женский</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="passportSeries">Серия паспорта</Label>
        <Input type="text" id="passportSeries" name="passportSeries" value={formData.passportSeries} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="passportNumber">Номер паспорта</Label>
        <Input type="text" id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="phoneNumber">Телефон</Label>
        <Input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}