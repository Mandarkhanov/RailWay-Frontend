import { useState, useEffect } from 'react';
import * as api from '../services/api';
import RouteStopCard from '../components/RouteStopCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import RouteStopForm from '../forms/RouteStopForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

export default function RouteStopsPage() {
  const [routeStops, setRouteStops] = useState([]);
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
      const data = await api.getRouteStops();
      setRouteStops(data);
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
      message: `Добавить новую остановку?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createRouteStop(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для остановки ID ${selectedItem.id}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateRouteStop(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить остановку ID ${item.id}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteRouteStop(id);
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

  if (loading) return <LoadingText>Загрузка остановок...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Остановки на маршрутах</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(routeStops, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem && !isFormModalOpen} onClose={closeModals} imageSrc="/src/assets/route-stop-placeholder.png" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>Остановка на маршруте "{selectedItem.route?.name}"</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Станция:</strong> {selectedItem.station?.name}</p>
            <p><strong>Порядок:</strong> {selectedItem.stopOrder}</p>
            <p><strong>Прибытие (смещение, мин):</strong> {selectedItem.arrivalOffset ?? 'N/A'}</p>
            <p><strong>Отправление (смещение, мин):</strong> {selectedItem.departureOffset ?? 'N/A'}</p>
            <p><strong>Платформа:</strong> {selectedItem.platform || 'N/A'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать остановку" : "Изменить остановку"}>
        <RouteStopForm routeStop={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <CardContainer>{routeStops.map(item => <RouteStopCard key={item.id} routeStop={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}