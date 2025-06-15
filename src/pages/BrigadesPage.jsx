import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import BrigadeCard from '../components/BrigadeCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import BrigadeForm from '../forms/BrigadeForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem, PageHeader } from './pageStyles';
import { Label, Input } from '../forms/formStyles';

export default function BrigadesPage() {
  const [brigades, setBrigades] = useState([]);
  const [brigadeNames, setBrigadeNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showNamesOnly, setShowNamesOnly] = useState(false);
  const [isSortedAZ, setIsSortedAZ] = useState(false);
  const [filters, setFilters] = useState({});

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
        const data = await api.getBrigadeNames();
        setBrigadeNames(data);
      } else {
        const data = await api.getBrigades();
        setBrigades(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
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
        message: `Создать новую бригаду "${formData.name}"?`,
        onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmCreate = async(formData) => {
    try {
        await api.createBrigade(formData);
        fetchData();
        closeModals();
    } catch(e) {
        alert(`Ошибка при создании: ${e.message}`);
    }
  };
  
  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Вы уверены, что хотите сохранить изменения для бригады "${itemToEdit.name}"?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      const updatedBrigade = await api.updateBrigade(itemToEdit.id, formData);
      setBrigades(brigades.map(b => b.id === updatedBrigade.id ? updatedBrigade : b));
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (brigade) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Вы уверены, что хотите удалить бригаду "${brigade.name}"?`,
      onConfirm: () => confirmDelete(brigade.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteBrigade(id);
      setBrigades(brigades.filter(b => b.id !== id));
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

  const openEditModal = (brigade) => {
    setIsCreating(false);
    setItemToEdit(brigade);
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

  const filteredAndSortedBrigades = useMemo(() => {
    let result = [...brigades];
    
    if (filters.minTotalSalary) {
      result = result.filter(b => b.totalSalary >= filters.minTotalSalary);
    }
    if (filters.minAverageSalary) {
        result = result.filter(b => b.averageSalary >= filters.minAverageSalary);
    }

    if (isSortedAZ) {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }
    return result;
  }, [brigades, isSortedAZ, filters]);

  const sortedBrigadeNames = useMemo(() => {
    if (!isSortedAZ) return brigadeNames;
    return [...brigadeNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [brigadeNames, isSortedAZ]);

  if (loading) return <LoadingText>Загрузка бригад...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Бригады ({loading ? '...' : filteredAndSortedBrigades.length})</h2>
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
            <FilterItem>
              <Label>Суммарная ЗП (от)</Label>
              <Input type="number" name="minTotalSalary" value={filters.minTotalSalary || ''} onChange={handleFilterChange} placeholder="300000" />
            </FilterItem>
            <FilterItem>
                <Label>Средняя ЗП (от)</Label>
                <Input type="number" name="minAverageSalary" value={filters.minAverageSalary || ''} onChange={handleFilterChange} placeholder="75000" />
            </FilterItem>
          </FilterDropdown>
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(brigades, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={() => setIsItemJsonModalOpen(false)}>
        {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
      </JsonModal>

      <DetailsModal isOpen={!!selectedItem} onClose={closeModals} imageSrc="/src/assets/brigade-placeholder.png" imageAspectRatio="16:9" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedItem && (
          <>
            <h2>{selectedItem.name}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Отдел:</strong> {selectedItem.department?.name || 'N/A'}</p>
            <p><strong>Менеджер:</strong> {selectedItem.manager ? `${selectedItem.manager.firstName} ${selectedItem.manager.lastName}` : 'N/A'}</p>
            {selectedItem.manager?.position && (
              <p><strong>Должность менеджера:</strong> {selectedItem.manager.position.name}</p>
            )}
            <p><strong>Сотрудников:</strong> {selectedItem.employeeCount}</p>
            <p><strong>Суммарная ЗП:</strong> {selectedItem.totalSalary != null ? `${new Intl.NumberFormat('ru-RU').format(selectedItem.totalSalary)} ₽` : 'N/A'}</p>
            <p><strong>Средняя ЗП:</strong> {selectedItem.averageSalary != null ? `${new Intl.NumberFormat('ru-RU').format(Math.round(selectedItem.averageSalary))} ₽` : 'N/A'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать бригаду" : "Изменить бригаду"}>
        <BrigadeForm brigade={isCreating ? null : itemToEdit} onSave={handleSave} onCancel={closeModals} />
      </FormModal>

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      {showNamesOnly ? (
        <NameList>{sortedBrigadeNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : (
        <CardContainer>{filteredAndSortedBrigades.map(brig => <BrigadeCard key={brig.id} brigade={brig} onClick={() => setSelectedItem(brig)} />)}</CardContainer>
      )}
    </PageContainer>
  );
}