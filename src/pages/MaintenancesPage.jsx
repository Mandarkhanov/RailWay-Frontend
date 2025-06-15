import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import MaintenanceCard from '../components/MaintenanceCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import MaintenanceForm from '../forms/MaintenanceForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const getAvatarForMaintenance = (maintenance) => {
    if (!maintenance) return '/src/assets/maintenance-placeholder.png';
    if (!maintenance.endDate) return '/src/assets/maintenance-inprogress.png';
    if (maintenance.isRepair) return '/src/assets/maintenance-completed-repair.png';
    return '/src/assets/maintenance-completed-planned.png';
};

const MaintenanceFilters = ({ filters, onFilterChange, trains }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Поезд</Label>
            <Select name="trainId" value={filters.trainId || ''} onChange={onFilterChange}>
                <option value="">Все поезда</option>
                {trains.map(t => <option key={t.id} value={t.id}>{t.model}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Период ТО (от и до)</Label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <Input type="datetime-local" name="dateFrom" value={filters.dateFrom || ''} onChange={onFilterChange} />
                <Input type="datetime-local" name="dateTo" value={filters.dateTo || ''} onChange={onFilterChange} />
            </div>
        </FilterItem>
    </FilterDropdown>
);

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState([]);
  const [trains, setTrains] = useState([]);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
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
    api.getTrains().then(setTrains).catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [data, countData] = await Promise.all([
        api.getMaintenances(activeFilters),
        api.getMaintenanceCount(activeFilters)
      ]);
      setMaintenances(data);
      setMaintenanceCount(countData.count);
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
      message: `Создать новую запись о ТО?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createMaintenance(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для ТО ID ${selectedItem.id}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateMaintenance(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить запись о ТО ID ${item.id}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteMaintenance(id);
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
        <h2>Техническое обслуживание ({loading ? '...' : maintenanceCount})</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <MaintenanceFilters filters={filters} onFilterChange={handleFilterChange} trains={trains} />
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      {loading ? (
        <LoadingText>Загрузка данных о ТО...</LoadingText>
      ) : error ? (
        <ErrorText>Ошибка при загрузке: {error}</ErrorText>
      ) : (
        <CardContainer>{maintenances.map(item => <MaintenanceCard key={item.id} maintenance={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
      )}

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(maintenances, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal
        isOpen={!!selectedItem && !isFormModalOpen}
        onClose={closeModals}
        imageSrc={getAvatarForMaintenance(selectedItem)}
        footer={<ModalFooter actions={detailModalActions} />}
      >
        {selectedItem && (
          <>
            <h2>ТО для {selectedItem.train?.model}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Тип:</strong> {selectedItem.type}</p>
            <p><strong>Ремонт:</strong> {selectedItem.isRepair ? 'Да' : 'Нет'}</p>
            <p><strong>Бригада:</strong> {selectedItem.brigade?.name || 'Не назначена'}</p>
            <p><strong>Дата начала:</strong> {new Date(selectedItem.startDate).toLocaleString()}</p>
            <p><strong>Дата окончания:</strong> {selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleString() : 'В процессе'}</p>
            <p><strong>Результат:</strong> {selectedItem.result || 'Нет данных'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать запись о ТО" : "Изменить запись о ТО"}>
        <MaintenanceForm maintenance={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

    </PageContainer>
  );
}