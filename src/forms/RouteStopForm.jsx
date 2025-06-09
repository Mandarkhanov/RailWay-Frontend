import { useState, useEffect } from 'react';
import ModalFooter from '../components/ModalFooter';
import * as api from '../services/api';
import { Form, FormGroup, Label, Input, Select } from './formStyles';

export default function RouteStopForm({ routeStop, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    routeId: routeStop?.route?.id || '',
    stationId: routeStop?.station?.id || '',
    stopOrder: routeStop?.stopOrder || '',
    arrivalOffset: routeStop?.arrivalOffset ?? '',
    departureOffset: routeStop?.departureOffset ?? '',
    platform: routeStop?.platform || '',
  });
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getRoutes(),
      api.getStations()
    ]).then(([routesData, stationsData]) => {
      setRoutes(routesData);
      setStations(stationsData);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      arrivalOffset: formData.arrivalOffset !== '' ? parseInt(formData.arrivalOffset, 10) : null,
      departureOffset: formData.departureOffset !== '' ? parseInt(formData.departureOffset, 10) : null,
    });
  };

  const actions = [
    { label: 'Отмена', onClick: onCancel, type: 'secondary' },
    { label: 'Сохранить', onClick: handleSave, type: 'primary' },
  ];

  return (
    <Form onSubmit={handleSave}>
      <FormGroup>
        <Label htmlFor="routeId">Маршрут</Label>
        <Select id="routeId" name="routeId" value={formData.routeId} onChange={handleChange} required>
          <option value="">Выберите маршрут</option>
          {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="stationId">Станция</Label>
        <Select id="stationId" name="stationId" value={formData.stationId} onChange={handleChange} required>
          <option value="">Выберите станцию</option>
          {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="stopOrder">Порядковый номер</Label>
        <Input type="number" id="stopOrder" name="stopOrder" value={formData.stopOrder} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="arrivalOffset">Смещение прибытия (мин)</Label>
        <Input type="number" id="arrivalOffset" name="arrivalOffset" value={formData.arrivalOffset} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="departureOffset">Смещение отправления (мин)</Label>
        <Input type="number" id="departureOffset" name="departureOffset" value={formData.departureOffset} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="platform">Платформа</Label>
        <Input type="text" id="platform" name="platform" value={formData.platform} onChange={handleChange} />
      </FormGroup>
      <ModalFooter actions={actions} />
    </Form>
  );
}