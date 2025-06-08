import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import PositionCard from '../components/PositionCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FilterDropdown from '../components/FilterDropdown';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import PositionForm from '../forms/PositionForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

export default function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [positionNames, setPositionNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNamesOnly, setShowNamesOnly] = useState(false);
  const [isSortedAZ, setIsSortedAZ] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  useEffect(() => {
    fetchData();
  }, [showNamesOnly]);

  const fetchData = async () => {
    try {
        setLoading(true);
        setError(null);
        if (showNamesOnly) {
          const data = await api.getPositionNames();
          setPositionNames(data);
        } else {
          const data = await api.getPositions();
          setPositions(data);
        }
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
        message: `Создать новую должность "${formData.name}"?`,
        onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async (formData) => {
    try {
        await api.createPosition(formData);
        fetchData();
        closeModals();
    } catch(e) {
        alert(`Ошибка при создании: ${e.message}`);
    }
  };

  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Вы уверены, что хотите сохранить изменения для должности "${itemToEdit.name}"?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      const updatedPosition = await api.updatePosition(itemToEdit.id, formData);
      setPositions(positions.map(p => p.id === updatedPosition.id ? updatedPosition : p));
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (position) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Вы уверены, что хотите удалить должность "${position.name}"?`,
      onConfirm: () => confirmDelete(position.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deletePosition(id);
      setPositions(positions.filter(p => p.id !== id));
      closeModals();
    } catch (e) {
      alert(`Ошибка при удалении: ${e.message}`);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (position) => {
    setIsCreating(false);
    setItemToEdit(position);
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const closeModals = () => {
    setSelectedItem(null);
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setItemToEdit(null);
    setItemToDelete(null);
    setIsCreating(false);
  };

  const detailModalActions = selectedItem ? [
    { label: 'Удалить', onClick: () => handleDelete(selectedItem), type: 'danger' },
    { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'primary' },
  ] : [];

  const sortedPositions = useMemo(() => {
    if (!isSortedAZ) return positions;
    return [...positions].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [positions, isSortedAZ]);

  const sortedPositionNames = useMemo(() => {
    if (!isSortedAZ) return positionNames;
    return [...positionNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [positionNames, isSortedAZ]);

  if (loading) return <LoadingText>Загрузка должностей...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Должности</h2>
      <TopBarActions>
        <ActionButton onClick={openCreateModal}>Создать</ActionButton>
        <FilterDropdown>
          <FilterItem>
            <label>Показать только названия</label>
            <input type="checkbox" checked={showNamesOnly} onChange={() => setShowNamesOnly(p => !p)} />
          </FilterItem>
          <FilterItem>
            <label>Сортировать А-Я</label>
            <input type="checkbox" checked={isSortedAZ} onChange={() => setIsSortedAZ(p => !p)} />
          </FilterItem>
        </FilterDropdown>
        <ActionButton onClick={() => setIsJsonModalOpen(true)}>JSON</ActionButton>
      </TopBarActions>

      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)}>
        {JSON.stringify(positions, null, 2)}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem} onClose={closeModals} imageSrc="/src/assets/position-placeholder.png" imageAspectRatio="portrait" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>{selectedItem.name}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Отдел:</strong> {selectedItem.department?.name || 'N/A'}</p>
            <p><strong>Зарплата:</strong> {selectedItem.minSalary || 'N/A'} - {selectedItem.maxSalary || 'N/A'} рублей</p>
            <p><strong>Описание:</strong> {selectedItem.description || 'Нет описания'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать должность" : "Изменить должность"}>
         <PositionForm position={isCreating ? null : itemToEdit} onSave={handleSave} onCancel={closeModals} />
      </FormModal>

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      {showNamesOnly ? (
        <NameList>{sortedPositionNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : (
        <CardContainer>{sortedPositions.map(pos => <PositionCard key={pos.id} position={pos} onClick={() => setSelectedItem(pos)} />)}</CardContainer>
      )}
    </PageContainer>
  );
}