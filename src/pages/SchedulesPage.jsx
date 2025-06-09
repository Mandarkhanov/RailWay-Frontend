import { useState, useEffect } from 'react';
import * as api from '../services/api';
import ScheduleCard from '../components/ScheduleCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ScheduleForm from '../forms/ScheduleForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
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
      const data = await api.getSchedules();
      setSchedules(data);
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

  if (loading) return <LoadingText>Загрузка рейсов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Рейсы</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

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
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать рейс" : "Изменить рейс"}>
        <ScheduleForm schedule={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <CardContainer>{schedules.map(item => <ScheduleCard key={item.id} schedule={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}