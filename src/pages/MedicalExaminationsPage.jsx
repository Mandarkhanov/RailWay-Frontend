import { useState, useEffect } from 'react';
import * as api from '../services/api';
import MedicalExaminationCard from '../components/MedicalExaminationsCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import MedicalExaminationForm from '../forms/MedicalExaminationForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem, PageHeader } from './pageStyles';

export default function MedicalExaminationsPage() {
  const [examinations, setExaminations] = useState([]);
  const [examinationSummaries, setExaminationSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSummariesOnly, setShowSummariesOnly] = useState(false);
  
  const [selectedExam, setSelectedExam] = useState(null);
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
  }, []);

  const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMedicalExaminations();
        setExaminations(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (examinations) {
      const summaries = examinations.map(exam =>
        `Осмотр ID ${exam.id} для ${exam.employee ? `${exam.employee.firstName} ${exam.employee.lastName}` : 'Неизвестный сотрудник'}`
      );
      setExaminationSummaries(summaries);
    }
  }, [examinations]);

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
        fetchData();
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
      const updatedExam = await api.updateMedicalExamination(itemToEdit.id, formData);
      setExaminations(examinations.map(ex => ex.id === updatedExam.id ? updatedExam : ex));
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
      setExaminations(examinations.filter(ex => ex.id !== id));
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
    setItemToDelete(null);
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

  if (loading) return <LoadingText>Загрузка медосмотров...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <PageHeader>
        <h2>Медицинские осмотры</h2>
        <TopBarActions>
          <ActionButton onClick={openCreateModal}>Создать</ActionButton>
          <FilterDropdown>
            <FilterItem>
              <label>Показать только сводку</label>
              <input
                type="checkbox"
                checked={showSummariesOnly}
                onChange={() => setShowSummariesOnly(p => !p)}
              />
            </FilterItem>
          </FilterDropdown>
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

      {showSummariesOnly ? (
        <NameList>{examinationSummaries.map((summary, index) => <li key={index}>{summary}</li>)}</NameList>
      ) : (
        <CardContainer>{examinations.map(exam =>
            <MedicalExaminationCard key={exam.id} exam={exam} onClick={() => setSelectedExam(exam)} />
        )}</CardContainer>
      )}
    </PageContainer>
  );
}