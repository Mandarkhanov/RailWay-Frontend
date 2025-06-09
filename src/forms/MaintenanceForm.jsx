import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select, Textarea } from './formStyles';

const maintenanceTypes = ['плановый', 'рейсовый', 'аварийный', 'деповской', 'ТО-1', 'ТО-2', 'ТР-1', 'ТР-2', 'ТР-3', 'КР-1', 'КР-2'];

const formatDateTimeForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function MaintenanceForm({ maintenance, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    trainId: maintenance?.train?.id || '',
    brigadeId: maintenance?.brigade?.id || '',
    startDate: formatDateTimeForInput(maintenance?.startDate),
    endDate: formatDateTimeForInput(maintenance?.endDate),
    type: maintenance?.type || 'плановый',
    result: maintenance?.result || '',
    isRepair: maintenance?.isRepair !== undefined ? maintenance.isRepair : false,
  });
  const [trains, setTrains] = useState([]);
  const [brigades, setBrigades] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getTrains(),
      api.getBrigades()
    ]).then(([trainsData, brigadesData]) => {
      setTrains(trainsData);
      setBrigades(brigadesData);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      trainId: parseInt(formData.trainId, 10),
      brigadeId: formData.brigadeId ? parseInt(formData.brigadeId, 10) : null,
      endDate: formData.endDate ? formData.endDate : null,
    };
    onSave(dataToSend);
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
      <FormGroup>
        <Label htmlFor="trainId">Поезд</Label>
        <Select id="trainId" name="trainId" value={formData.trainId} onChange={handleChange} required>
          <option value="">Выберите поезд</option>
          {trains.map(t => <option key={t.id} value={t.id}>{t.model}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="brigadeId">Бригада</Label>
        <Select id="brigadeId" name="brigadeId" value={formData.brigadeId} onChange={handleChange}>
          <option value="">Выберите бригаду</option>
          {brigades.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="type">Тип ТО</Label>
        <Select id="type" name="type" value={formData.type} onChange={handleChange}>
          {maintenanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="startDate">Дата начала</Label>
        <Input type="datetime-local" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="endDate">Дата окончания</Label>
        <Input type="datetime-local" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" name="isRepair" checked={formData.isRepair} onChange={handleChange} />
          Ремонт
        </Label>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="result">Результат</Label>
        <Textarea id="result" name="result" value={formData.result} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}