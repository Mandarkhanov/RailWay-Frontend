import { useState, useEffect } from 'react';
import * as api from '../services/api';
import CarCard from '../components/CarCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CarForm from '../forms/CarForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

// Хелпер для выбора изображения по типу вагона
const getAvatarForCar = (car) => {
  if (!car?.carType) return '/src/assets/car-placeholder.png';
  
  switch (car.carType) {
    case 'плацкарт':
      return '/src/assets/car-platzkart.png';
    case 'купе':
      return '/src/assets/car-coupe.png';
    case 'спальный':
      return '/src/assets/car-sleeper.png';
    case 'сидячий':
      return '/src/assets/car-seated.png';
    case 'ресторан':
      return '/src/assets/car-restaurant.png';
    case 'багажный':
      return '/src/assets/car-luggage.png';
    default:
      return '/src/assets/car-coupe.png';
  }
};

export default function CarsPage() {
  const [cars, setCars] = useState([]);
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
      const data = await api.getCars();
      setCars(data);
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
      message: `Создать новый вагон №${formData.carNumber}?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createCar(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для вагона №${selectedItem.carNumber}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateCar(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить вагон №${item.carNumber}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteCar(id);
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

  if (loading) return <LoadingText>Загрузка вагонов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Вагоны</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(cars, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal
        isOpen={!!selectedItem && !isFormModalOpen}
        onClose={closeModals}
        imageSrc={getAvatarForCar(selectedItem)}
        footer={<ModalFooter actions={detailModalActions} />}
      >
        {selectedItem && (
          <>
            <h2>Вагон №{selectedItem.carNumber}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Тип:</strong> {selectedItem.carType}</p>
            <p><strong>Поезд:</strong> {selectedItem.train?.model || 'Не назначен'}</p>
            <p><strong>Вместимость:</strong> {selectedItem.capacity}</p>
            <p><strong>Дата постройки:</strong> {selectedItem.buildDate ? new Date(selectedItem.buildDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Статус:</strong> {selectedItem.status}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать вагон" : "Изменить вагон"}>
        <CarForm car={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <CardContainer>{cars.map(item => <CarCard key={item.id} car={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}