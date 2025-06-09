import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function RouteForm({ route, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    startStationId: route?.startStation?.id || '',
    endStationId: route?.endStation?.id || '',
    distanceKm: route?.distanceKm || '',
    categoryId: route?.category?.id || '',
  });
  const [stations, setStations] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getStations(),
      api.getRouteCategories()
    ]).then(([stationsData, categoriesData]) => {
      setStations(stationsData);
      setCategories(categoriesData);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...formData, distanceKm: parseInt(formData.distanceKm, 10) });
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
      <FormGroup>
        <Label htmlFor="name">Название маршрута</Label>
        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="startStationId">Начальная станция</Label>
        <Select id="startStationId" name="startStationId" value={formData.startStationId} onChange={handleChange} required>
          <option value="">Выберите станцию</option>
          {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="endStationId">Конечная станция</Label>
        <Select id="endStationId" name="endStationId" value={formData.endStationId} onChange={handleChange} required>
          <option value="">Выберите станцию</option>
          {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="distanceKm">Дистанция (км)</Label>
        <Input type="number" id="distanceKm" name="distanceKm" value={formData.distanceKm} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="categoryId">Категория</Label>
        <Select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}>
          <option value="">Выберите категорию</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}