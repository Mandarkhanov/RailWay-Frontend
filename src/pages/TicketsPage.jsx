import { useState, useEffect } from 'react';
import * as api from '../services/api';
import TicketCard from '../components/TicketCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TicketForm from '../forms/TicketForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader } from './pageStyles';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
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
      const data = await api.getTickets();
      setTickets(data);
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
      message: `Создать новый билет?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
      await api.createTicket(formData);
      fetchData();
      closeModals();
    } catch(e) {
      alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Сохранить изменения для билета ID ${selectedItem.id}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateTicket(selectedItem.id, formData);
      fetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (item) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Удалить билет ID ${item.id}?`,
      onConfirm: () => confirmDelete(item.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteTicket(id);
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

  if (loading) return <LoadingText>Загрузка билетов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Билеты</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(tickets, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem && !isFormModalOpen} onClose={closeModals} imageSrc="/src/assets/ticket-placeholder.png" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>Билет ID: {selectedItem.id}</h2>
            <p><strong>Пассажир:</strong> {selectedItem.passenger?.lastName} {selectedItem.passenger?.firstName}</p>
            <p><strong>Рейс:</strong> №{selectedItem.schedule?.trainNumber} ({selectedItem.schedule?.route?.name})</p>
            <p><strong>Отправление:</strong> {new Date(selectedItem.schedule.departureTime).toLocaleString()}</p>
            <p><strong>Место:</strong> Вагон №{selectedItem.seat?.car?.carNumber}, место №{selectedItem.seat?.seatNumber}</p>
            <p><strong>Багаж:</strong> {selectedItem.luggage ? `ID ${selectedItem.luggage.id}` : 'Нет'}</p>
            <p><strong>Дата покупки:</strong> {new Date(selectedItem.purchaseDate).toLocaleString()}</p>
            <p><strong>Цена:</strong> {selectedItem.price} руб.</p>
            <p><strong>Статус:</strong> {selectedItem.ticketStatus}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать билет" : "Изменить билет"}>
        <TicketForm ticket={selectedItem} onSave={handleSave} onCancel={closeModals} />
      </FormModal>
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <CardContainer>{tickets.map(item => <TicketCard key={item.id} ticket={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
    </PageContainer>
  );
}