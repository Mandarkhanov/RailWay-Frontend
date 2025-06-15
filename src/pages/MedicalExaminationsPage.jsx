import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import MedicalExaminationCard from '../components/MedicalExaminationsCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import MedicalExaminationForm from '../forms/MedicalExaminationForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem, PageHeader } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const MedicalExaminationFilters = ({ filters, onFilterChange, positions }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Должность</Label>
            <Select name="positionId" value={filters.positionId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Результат</Label>
            <Select name="result" value={filters.result ?? ''} onChange={onFilterChange}>
                <option value="">Любой</option>
                <option value="true">Годен</option>
                <option value="false">Не годен</option>
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Год</Label>
            <Input type="number" name="year" value={filters.year || ''} onChange={onFilterChange} placeholder="Напр. 2023" />
        </FilterItem>
        <FilterItem>
            <Label>Пол</Label>
            <Select name="gender" value={filters.gender || ''} onChange={onFilterChange}>
                <option value="">Любой</option>
                <option value="М">М</option>
                <option value="Ж">Ж</option>
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Возраст (от и до)</Label>
            <div style={{display: 'flex', gap: '5px'}}>
                <Input style={{width: '60px'}} type="number" name="minAge" value={filters.minAge || ''} onChange={onFilterChange} placeholder="20" />
                <Input style={{width: '60px'}} type="number" name="maxAge" value={filters.maxAge || ''} onChange={onFilterChange} placeholder="50" />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Зарплата (от и до)</Label>
            <div style={{display: 'flex', gap: '5px'}}>
                <Input style={{width: '80px'}} type="number" name="minSalary" value={filters.minSalary || ''} onChange={onFilterChange} placeholder="50000" />
                <Input style={{width: '80px'}} type="number" name="maxSalary" value={filters.maxSalary || ''} onChange={onFilterChange} placeholder="100000" />
            </div>
        </FilterItem>
    </FilterDropdown>
);


export default function MedicalExaminationsPage() {
  const [examinations, setExaminations] = useState([]);
  const [examCount, setExamCount] = useState(0);
  const [positions, setPositions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({});
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
  const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  useEffect(() => {
      api.getPositions().then(setPositions).catch(console.error);
  }, []);
  
  const refetchData = useCallback(() => {
    setFilters(prev => ({ ...prev }));
  }, []);

  useEffect(() => {
    const fetchFilteredData = async () => {
        setLoading(true);
        setError(null);

        const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});

        try {
            const [examsData, countData] = await Promise.all([
                api.getMedicalExaminations(activeFilters),
                api.getMedicalExaminationCount(activeFilters),
            ]);
            setExaminations(examsData);
            setExamCount(countData.count);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchFilteredData();
  }, [filters]);

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
        message: `Создать новый медосмотр?`,
        onConfirm: () => confirmCreate(formData),
    });
    setIsConfirmModalOpen(true);
  };
  
  const confirmCreate = async (formData) => {
    try {
        await api.createMedicalExamination(formData);
        refetchData();
        closeModals();
    } catch(e) {
        alert(`Ошибка при создании: ${e.message}`);
    }
  };

  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Вы уверены, что хотите сохранить изменения для медосмотра ID ${itemToEdit.id}?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUpdate = async (formData) => {
    try {
      await api.updateMedicalExamination(itemToEdit.id, formData);
      refetchData();
      closeModals();
    } catch (e) {
      alert(`Ошибка при обновлении: ${e.message}`);
    }
  };

  const handleDelete = (exam) => {
    const employeeName = exam.employee ? `${exam.employee.firstName} ${exam.employee.lastName}` : `ID ${exam.id}`;
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Вы уверены, что хотите удалить медосмотр для сотрудника ${employeeName}?`,
      onConfirm: () => confirmDelete(exam.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteMedicalExamination(id);
      refetchData();
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

  const openEditModal = (exam) => {
    setIsCreating(false);
    setItemToEdit(exam);
    setSelectedExam(null);
    setIsFormModalOpen(true);
  };

  const closeModals = () => {
    setSelectedExam(null);
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setItemToEdit(null);
    setIsCreating(false);
    setIsItemJsonModalOpen(false);
  };

  const openItemJsonModal = () => {
    setIsItemJsonModalOpen(true);
  };

  const detailModalActions = selectedExam ? [
    { label: 'Изменить', onClick: () => openEditModal(selectedExam), type: 'primary' },
    { label: 'Удалить', onClick: () => handleDelete(selectedExam), type: 'danger' },
    { label: 'JSON', onClick: openItemJsonModal, type: 'secondary' },
  ] : [];

  const getAvatarForExam = (exam) => {
    if (!exam) return '/src/assets/employee-placeholder.png';
    return exam.result ? '/src/assets/healthy-worker.png' : '/src/assets/sick-worker.png';
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <h2>Медицинские осмотры ({loading ? '...' : examCount})</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <MedicalExaminationFilters filters={filters} onFilterChange={handleFilterChange} positions={positions} />
          <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
      </PageHeader>

      <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
        {JSON.stringify(examinations, null, 2)}
      </JsonModal>

      <JsonModal isOpen={isItemJsonModalOpen} onClose={() => setIsItemJsonModalOpen(false)}>
        {selectedExam ? JSON.stringify(selectedExam, null, 2) : ''}
      </JsonModal>
      
      <DetailsModal isOpen={!!selectedExam} onClose={closeModals} imageSrc={getAvatarForExam(selectedExam)} imageAspectRatio="portrait" footer={<ModalFooter actions={detailModalActions} />}>
        {selectedExam && (
          <>
            <h2>Медосмотр: {selectedExam.employee ? `${selectedExam.employee.firstName} ${selectedExam.employee.lastName}` : 'N/A'}</h2>
            <p><strong>ID осмотра:</strong> {selectedExam.id}</p>
            {selectedExam.employee && (
              <>
                <p><strong>ID сотрудника:</strong> {selectedExam.employee.id}</p>
                <p><strong>Должность:</strong> {selectedExam.employee.position?.name || 'N/A'}</p>
              </>
            )}
            <p><strong>Дата осмотра:</strong> {new Date(selectedExam.examinationDate).toLocaleDateString()}</p>
            <p><strong>Результат:</strong> {selectedExam.result ? 'Годен' : 'Не годен'}</p>
            <p><strong>Заметки:</strong> {selectedExam.notes || 'Нет заметок'}</p>
          </>
        )}
      </DetailsModal>
      
      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать медосмотр" : "Изменить медосмотр"}>
        <MedicalExaminationForm exam={isCreating ? null : itemToEdit} onSave={handleSave} onCancel={closeModals} />
      </FormModal>

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      {loading ? (
        <LoadingText>Загрузка медосмотров...</LoadingText>
      ) : error ? (
        <ErrorText>Ошибка при загрузке: {error}</ErrorText>
      ) : (
        <CardContainer>{examinations.map(exam =>
            <MedicalExaminationCard key={exam.id} exam={exam} onClick={() => setSelectedExam(exam)} />
        )}</CardContainer>
      )}
    </PageContainer>
  );
}