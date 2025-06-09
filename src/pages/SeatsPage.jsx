import { useState, useEffect } from 'react';
import * as api from '../services/api';
import SeatCard from '../components/SeatCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SeatForm from '../forms/SeatForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

// Хелпер для выбора изображения по типу места
const getAvatarForSeat = (seat) => {
  if (!seat?.seatType) return '/src/assets/seat-placeholder.png';
  
  const type = seat.seatType.toLowerCase();
  if (type.includes('боковое')) return '/src/assets/seat-side.png';
  if (type.includes('верхнее')) return '/src/assets/seat-upper.png';
  if (type.includes('нижнее')) return '/src/assets/seat-lower.png';
  if (type.includes('окна')) return '/src/assets/seat-window.png';
  if (type.includes('прохода')) return '/src/assets/seat-aisle.png';

  return '/src/assets/seat-placeholder.png';
};

export default function SeatsPage() {
  const [seats, setSeats] = useState([]);
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
      const data = await api.getSeats();
      setSeats(data);
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
      message: `Создать новое место №${formData.seatNumber}?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createSeat(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для места №${selectedItem.seatNumber}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateSeat(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить место №${item.seatNumber} в вагоне №${item.car?.carNumber}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteSeat(id);
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

  if (loading) return <LoadingText>Загрузка мест...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Места в вагонах</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(seats, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal
        isOpen={!!selectedItem && !isFormModalOpen}
        onClose={closeModals}
        imageSrc={getAvatarForSeat(selectedItem)}
        footer={<ModalFooter actions={detailModalActions} />}
      >
        {selectedItem && (
          <>
            <h2>Место {selectedItem.seatNumber}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Вагон:</strong> №{selectedItem.car?.carNumber} ({selectedItem.car?.carType})</p>
            <p><strong>Тип места:</strong> {selectedItem.seatType}</p>
            <p><strong>Доступно:</strong> {selectedItem.isAvailable ? 'Да' : 'Нет'}</p>
            <p><strong>Особенности:</strong> {selectedItem.features || 'Нет'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать место" : "Изменить место"}>
        <SeatForm seat={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <CardContainer>{seats.map(item => <SeatCard key={item.id} seat={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}