import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import TrainCard from '../components/TrainCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TrainForm from '../forms/TrainForm';
import ModalFooter from '../components/ModalFooter';
import EmployeeCard from '../components/EmployeeCard';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const getAvatarForTrain = (train) => {
  if (!train?.status) return '/src/assets/train-placeholder.png';
  switch (train.status) {
    case 'в порядке': return '/src/assets/train-ok.png';
    case 'требует ремонта': return '/src/assets/train-warning.png';
    case 'в ремонте': return '/src/assets/train-repair.png';
    case 'списан': return '/src/assets/train-decommissioned.png';
    default: return '/src/assets/train-placeholder.png';
  }
};

const TrainFilters = ({ filters, onFilterChange, stations, routes }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Маршрут</Label>
            <Select name="routeId" value={filters.routeId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Длина маршрута (км)</Label>
            <div style={{display: 'flex', gap: '5px'}}>
                <Input style={{width: '70px'}} type="number" name="minDistance" value={filters.minDistance || ''} onChange={onFilterChange} placeholder="От" />
                <Input style={{width: '70px'}} type="number" name="maxDistance" value={filters.maxDistance || ''} onChange={onFilterChange} placeholder="До" />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Станция</Label>
            <Select name="stationId" value={filters.stationId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
        </FilterItem>
        {filters.stationId && (
            <FilterItem>
                <Label>Прибытие до:</Label>
                <Input
                    type="datetime-local"
                    name="arrivalTimeTo"
                    value={filters.arrivalTimeTo || ''}
                    onChange={onFilterChange}
                />
            </FilterItem>
        )}
        <FilterItem>
            <Label>Минимум рейсов</Label>
            <Input type="number" name="minTrips" value={filters.minTrips || ''} onChange={onFilterChange} placeholder="Напр. 1" />
        </FilterItem>
        <FilterItem>
            <Label>Плановый ТО за период:</Label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <Input type="date" name="maintPlanFrom" value={filters.maintPlanFrom || ''} onChange={onFilterChange} />
                <Input type="date" name="maintPlanTo" value={filters.maintPlanTo || ''} onChange={onFilterChange} />
            </div>
        </FilterItem>
         <FilterItem>
            <Label>В ремонте за период:</Label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <Input type="date" name="maintRepairFrom" value={filters.maintRepairFrom || ''} onChange={onFilterChange} />
                <Input type="date" name="maintRepairTo" value={filters.maintRepairTo || ''} onChange={onFilterChange} />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Кол-во ремонтов (точно):</Label>
            <Input type="number" name="repairCount" value={filters.repairCount || ''} onChange={onFilterChange} placeholder="Напр. 3" />
        </FilterItem>
        <FilterItem>
            <Label>Возраст (от и до):</Label>
            <div style={{display: 'flex', gap: '5px'}}>
                <Input style={{width: '60px'}} type="number" name="minAge" value={filters.minAge || ''} onChange={onFilterChange} placeholder="5" />
                <Input style={{width: '60px'}} type="number" name="maxAge" value={filters.maxAge || ''} onChange={onFilterChange} placeholder="10" />
            </div>
        </FilterItem>
    </FilterDropdown>
);

export default function TrainsPage() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trainCount, setTrainCount] = useState(0);
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

  const [isPersonnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);
  const [isPersonnelLoading, setIsPersonnelLoading] = useState(false);
  const [trainForPersonnel, setTrainForPersonnel] = useState(null);

  useEffect(() => {
    api.getStations().then(setStations).catch(console.error);
    api.getRoutes().then(setRoutes).catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [trainsData, countData] = await Promise.all([
          api.getTrains(activeFilters),
          api.getTrainCount(activeFilters)
      ]);

      setTrains(trainsData);
      setTrainCount(countData.count);
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
      message: `Создать новый поезд модели "${formData.model}"?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createTrain(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для поезда "${selectedItem.model}"?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateTrain(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить поезд "${item.model}" (ID: ${item.id})?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteTrain(id);
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
    setPersonnelModalOpen(false);
  };
  
  const openItemJsonModal = () => {
    setIsItemJsonModalOpen(true);
  };

  const handleShowPersonnel = async () => {
    if (!selectedItem) return;
    setTrainForPersonnel(selectedItem);
    setSelectedItem(null); 
    setIsPersonnelLoading(true);
    setPersonnelModalOpen(true);
    try {
      const data = await api.getTrainPersonnel(selectedItem.id);
      setPersonnelList(data);
    } catch (err) {
      alert(`Ошибка при загрузке персонала: ${err.message}`);
    } finally {
      setIsPersonnelLoading(false);
    }
  };
  
  const detailModalActions = selectedItem ? [
    { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'secondary' },
    { label: 'Персонал', onClick: handleShowPersonnel, type: 'primary' },
    { label: 'Удалить', onClick: () => handleDelete(selectedItem), type: 'danger' },
    { label: 'JSON', onClick: openItemJsonModal, type: 'secondary' },
  ] : [];

  return (
    <PageContainer>
      <PageHeader>
        <h2>Поезда ({loading ? '...' : trainCount})</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <TrainFilters filters={filters} onFilterChange={handleFilterChange} stations={stations} routes={routes} />
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      {loading ? (
        <LoadingText>Загрузка поездов...</LoadingText>
      ) : error ? (
        <ErrorText>Ошибка: {error}</ErrorText>
      ) : (
        <CardContainer>{trains.map(item => <TrainCard key={item.id} train={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
      )}

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(trains, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal
        isOpen={!!selectedItem && !isFormModalOpen}
        onClose={closeModals}
        imageSrc={getAvatarForTrain(selectedItem)}
        footer={<ModalFooter actions={detailModalActions} />}
      >
        {selectedItem && (
          <>
            <h2>{selectedItem.model}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Совершено рейсов:</strong> {selectedItem.tripsCount}</p>
            <p><strong>Всего ТО:</strong> {selectedItem.maintenanceCount}</p>
            <p><strong>Кол-во ремонтов:</strong> {selectedItem.repairCount}</p>
            <p><strong>Дата постройки:</strong> {selectedItem.buildDate ? new Date(selectedItem.buildDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Дата последнего ТО:</strong> {selectedItem.lastMaintenanceDate ? new Date(selectedItem.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Статус:</strong> {selectedItem.status}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать поезд" : "Изменить поезд"}>
        <TrainForm train={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>

      <FormModal isOpen={isPersonnelModalOpen} onClose={closeModals} title={`Персонал поезда "${trainForPersonnel?.model}"`}>
        {isPersonnelLoading ? (
            <LoadingText>Загрузка персонала...</LoadingText>
        ) : personnelList.length > 0 ? (
            <CardContainer style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                {personnelList.map(emp => <EmployeeCard key={emp.id} employee={emp} onClick={() => alert(`ID сотрудника: ${emp.id}`)} />)}
            </CardContainer>
        ) : (
            <p>Для этого поезда нет назначенного персонала.</p>
        )}
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />
    </PageContainer>
  );
}