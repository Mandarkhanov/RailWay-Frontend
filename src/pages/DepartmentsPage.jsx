import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import DepartmentCard from '../components/DepartmentCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import DepartmentForm from '../forms/DepartmentForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem, PageHeader } from './pageStyles';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [departmentNames, setDepartmentNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showNamesOnly, setShowNamesOnly] = useState(false);
  const [isSortedAZ, setIsSortedAZ] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
  const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
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
        const data = await api.getDepartmentNames();
        setDepartmentNames(data);
      } else {
        const data = await api.getDepartments();
        setDepartments(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (formData) => {
    if (isCreating) {
      handleCreate(formData);
    } else {
      handleUpdate(formData);
    }
  };

  const handleCreate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите создание',
      message: `Вы уверены, что хотите создать новый отдел "${formData.name}"?`,
      onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };
  
  const confirmCreate = async (formData) => {
      try {
        await api.createDepartment(formData);
        fetchData();
        closeModals();
      } catch (e) {
        alert(`Ошибка при создании: ${e.message}`);
      }
  };

  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Вы уверены, что хотите сохранить изменения для отдела "${itemToEdit.name}"?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      const updatedDepartment = await api.updateDepartment(itemToEdit.id, formData);
      setDepartments(departments.map(d => d.id === updatedDepartment.id ? updatedDepartment : d));
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (department) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Вы уверены, что хотите удалить отдел "${department.name}"?`,
      onConfirm: () => confirmDelete(department.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
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

  const openEditModal = (department) => {
    setIsCreating(false);
    setItemToEdit(department);
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

  const sortedDepartments = useMemo(() => {
    if (!isSortedAZ) return departments;
    return [...departments].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [departments, isSortedAZ]);

  const sortedDepartmentNames = useMemo(() => {
    if (!isSortedAZ) return departmentNames;
    return [...departmentNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [departmentNames, isSortedAZ]);
  
  if (loading) return <LoadingText>Загрузка отделов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Отделы</h2>
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
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(departments, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={() => setIsItemJsonModalOpen(false)}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem} onClose={closeModals} imageSrc="/src/assets/department-placeholder.png" imageAspectRatio="16:9" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>{selectedItem.name}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Менеджер:</strong> {selectedItem.manager ? `${selectedItem.manager.firstName} ${selectedItem.manager.lastName}` : 'Не назначен'}</p>
            <p><strong>Описание:</strong> {selectedItem.description || 'Нет описания'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать отдел" : "Изменить отдел"}>
        <DepartmentForm department={isCreating ? null : itemToEdit} onSave={handleSave} onCancel={closeModals} />
      </FormModal>

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      {showNamesOnly ? (
        <NameList>{sortedDepartmentNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : (
        <CardContainer>{sortedDepartments.map(dept => <DepartmentCard key={dept.id} department={dept} onClick={() => setSelectedItem(dept)} />)}</CardContainer>
      )}
    </PageContainer>
  );
}