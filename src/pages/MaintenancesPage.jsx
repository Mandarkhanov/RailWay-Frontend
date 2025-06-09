import { useState, useEffect } from 'react';
import * as api from '../services/api';
import MaintenanceCard from '../components/MaintenanceCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import MaintenanceForm from '../forms/MaintenanceForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

// Хелпер для выбора изображения по статусу ТО
const getAvatarForMaintenance = (maintenance) => {
    if (!maintenance) return '/src/assets/maintenance-placeholder.png';
    
    if (!maintenance.endDate) {
      return '/src/assets/maintenance-inprogress.png'; // ТО в процессе
    }
    if (maintenance.isRepair) {
      return '/src/assets/maintenance-completed-repair.png'; // Завершенный ремонт
    }
    return '/src/assets/maintenance-completed-planned.png'; // Завершенное плановое ТО
};

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
  const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMaintenances();
      setMaintenances(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (formData) => {
    isCreating ? handleCreate(formData) : handleUpdate(formData);
  };
  
  const handleCreate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите создание',
      message: `Создать новую запись о ТО для поезда?`,
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

  if (loading) return <LoadingText>Загрузка данных о ТО...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Техническое обслуживание</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

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

      <CardContainer>{maintenances.map(item => <MaintenanceCard key={item.id} maintenance={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}