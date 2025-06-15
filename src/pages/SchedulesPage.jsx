import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import ScheduleCard from '../components/ScheduleCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ScheduleForm from '../forms/ScheduleForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const scheduleStatuses = ['по расписанию', 'задержан', 'отменен', 'выполнен', 'в пути'];

const ScheduleFilters = ({ filters, onFilterChange, routes }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Маршрут</Label>
            <Select name="routeId" value={filters.routeId || ''} onChange={onFilterChange}>
                <option value="">Все маршруты</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Статус рейса</Label>
            <Select name="trainStatus" value={filters.trainStatus || ''} onChange={onFilterChange}>
                <option value="">Все статусы</option>
                {scheduleStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Цена (от и до)</Label>
            <div style={{display: 'flex', gap: '5px'}}>
                <Input style={{width: '80px'}} type="number" name="minPrice" value={filters.minPrice || ''} onChange={onFilterChange} placeholder="1000" />
                <Input style={{width: '80px'}} type="number" name="maxPrice" value={filters.maxPrice || ''} onChange={onFilterChange} placeholder="5000" />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Сданных билетов (от)</Label>
            <Input type="number" name="minReturnedTickets" value={filters.minReturnedTickets || ''} onChange={onFilterChange} placeholder="Напр. 1" />
        </FilterItem>
    </FilterDropdown>
);

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
  const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  useEffect(() => {
    api.getRoutes().then(setRoutes).catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [data, countData] = await Promise.all([
        api.getSchedules(activeFilters),
        api.getScheduleCount(activeFilters)
      ]);
      setSchedules(data);
      setScheduleCount(countData.count);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (formData) => {
    isCreating ? handleCreate(formData) : handleUpdate(formData);
  };
  
  const handleCreate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите создание',
      message: `Создать новый рейс №${formData.trainNumber}?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createSchedule(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для рейса №${selectedItem.trainNumber}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateSchedule(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить рейс №${item.trainNumber}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteSchedule(id);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при удалении: ${e.message}`);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsCreating(false);
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };
  
  const closeModals = () => {
    setSelectedItem(null);
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setIsCreating(false);
    setIsItemJsonModalOpen(false);
  };
  
  const openItemJsonModal = () => {
    setIsItemJsonModalOpen(true);
  };
  
  const detailModalActions = selectedItem ? [
    { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'primary' },
    { label: 'Удалить', onClick: () => handleDelete(selectedItem), type: 'danger' },
    { label: 'JSON', onClick: openItemJsonModal, type: 'secondary' },
  ] : [];

  return (
    <PageContainer>
      <PageHeader>
        <h2>Рейсы ({loading ? '...' : scheduleCount})</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ScheduleFilters filters={filters} onFilterChange={handleFilterChange} routes={routes} />
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>
      
      {loading ? (
        <LoadingText>Загрузка рейсов...</LoadingText>
      ) : error ? (
        <ErrorText>Ошибка: {error}</ErrorText>
      ) : (
        <CardContainer>{schedules.map(item => <ScheduleCard key={item.id} schedule={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
      )}

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(schedules, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem && !isFormModalOpen} onClose={closeModals} imageSrc="/src/assets/schedule-placeholder.png" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>Рейс №{selectedItem.trainNumber}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Поезд:</strong> {selectedItem.train?.model}</p>
            <p><strong>Тип:</strong> {selectedItem.type?.name}</p>
            <p><strong>Маршрут:</strong> {selectedItem.route?.name}</p>
            <p><strong>Отправление:</strong> {new Date(selectedItem.departureTime).toLocaleString()}</p>
            <p><strong>Прибытие:</strong> {new Date(selectedItem.arrivalTime).toLocaleString()}</p>
            <p><strong>Цена:</strong> {selectedItem.basePrice} руб.</p>
            <p><strong>Статус:</strong> {selectedItem.trainStatus}</p>
            <hr />
            <h4>Статистика по билетам:</h4>
            <p><strong>Всего билетов:</strong> {selectedItem.totalTickets}</p>
            <p><strong>Оплачено:</strong> {selectedItem.paidTickets}</p>
            <p><strong>Забронировано:</strong> {selectedItem.bookedTickets}</p>
            <p><strong>Возвращено:</strong> {selectedItem.returnedTickets}</p>
            <p><strong>Использовано:</strong> {selectedItem.usedTickets}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать рейс" : "Изменить рейс"}>
        <ScheduleForm schedule={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

    </PageContainer>
  );
}