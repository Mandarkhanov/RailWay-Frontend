import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';
import EmployeeCard from '../components/EmployeeCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import EmployeeForm from '../forms/EmployeeForm';
import ModalFooter from '../components/ModalFooter';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const getAvatarForEmployee = (employee) => {
  if (!employee?.gender) return '/src/assets/employee-placeholder.png';
  const gender = employee.gender.toLowerCase();
  if (gender === 'м') return '/src/assets/male-employee-placeholder.png';
  if (gender === 'ж') return '/src/assets/female-employee-placeholder.png';
  return '/src/assets/employee-placeholder.png';
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [employeeNames, setEmployeeNames] = useState([]);
    const [positions, setPositions] = useState([]);
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

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [employeesData, positionsData] = await Promise.all([
                api.getEmployees(),
                api.getPositions()
            ]);
            setEmployees(employeesData);
            setPositions(positionsData);
        } catch(e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (showNamesOnly) {
        api.getEmployeeNames().then(setEmployeeNames).catch(setError);
    }
  }, [showNamesOnly]);

  const fetchData = async () => {
    try {
        setLoading(true);
        const data = await api.getEmployees();
        setEmployees(data);
    } catch(e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const showAlert = (message) => {
      setAlertConfig({ title: "Ошибка валидации", message });
      setIsAlertModalOpen(true);
  };

  const handleSave = (formData) => {
    const salary = parseFloat(formData.salary);
    const positionId = parseInt(formData.positionId, 10);
    
    if (!positionId) {
        showAlert("Необходимо выбрать должность.");
        return;
    }
    
    const selectedPosition = positions.find(p => p.id === positionId);

    if (selectedPosition && !isNaN(salary)) {
        const { minSalary, maxSalary } = selectedPosition;
        if (minSalary !== null && salary < minSalary) {
            showAlert(`Зарплата (${salary}) не может быть меньше минимальной (${minSalary}) для этой должности.`);
            return;
        }
        if (maxSalary !== null && salary > maxSalary) {
            showAlert(`Зарплата (${salary}) не может быть больше максимальной (${maxSalary}) для этой должности.`);
            return;
        }
    }
    
    if (isCreating) {
      handleCreate(formData);
    } else {
      handleUpdate(formData);
    }
  };
  
  const handleCreate = (formData) => {
    const fullDto = { 
        ...formData, 
        birthDate: '1990-01-01',
        gender: 'М',
        childrenCount: 0,
        salary: parseFloat(formData.salary) || null,
        positionId: parseInt(formData.positionId, 10)
    };
    setConfirmConfig({
        title: 'Подтвердите создание',
        message: `Создать нового сотрудника "${formData.firstName} ${formData.lastName}"?`,
        onConfirm: () => confirmCreate(fullDto),
    });
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(true);
  };
  
  const confirmCreate = async(formData) => {
    try {
        await api.createEmployee(formData);
        fetchData();
        closeModals();
    } catch(e) {
        setConfirmConfig({});
        setIsConfirmModalOpen(false);
        showAlert(e.message);
    }
  };

  const handleUpdate = (formData) => {
    setConfirmConfig({
      title: 'Подтвердите изменение',
      message: `Вы уверены, что хотите сохранить изменения для сотрудника "${itemToEdit.firstName} ${itemToEdit.lastName}"?`,
      onConfirm: () => confirmUpdate(formData),
    });
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(true);
  };
  
  const confirmUpdate = async (formData) => {
    const dtoToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: itemToEdit.birthDate, 
      gender: itemToEdit.gender,
      childrenCount: itemToEdit.childrenCount,
      hireDate: formData.hireDate,
      positionId: parseInt(formData.positionId, 10),
      salary: parseFloat(formData.salary) || null,
      isActive: formData.isActive,
    };

    try {
      const updatedEmployee = await api.updateEmployee(itemToEdit.id, dtoToSend);
      setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      closeModals();
    } catch (e) {
      setConfirmConfig({});
      setIsConfirmModalOpen(false);
      showAlert(e.message);
    }
  };
  
  const handleDelete = (employee) => {
    setConfirmConfig({
      title: 'Подтвердите удаление',
      message: `Вы уверены, что хотите удалить сотрудника "${employee.firstName} ${employee.lastName}"?`,
      onConfirm: () => confirmDelete(employee.id),
    });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async (id) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(employees.filter(e => e.id !== id));
      closeModals();
    } catch (e) {
      closeModals();
      showAlert(e.message);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (employee) => {
    setIsCreating(false);
    setItemToEdit(employee);
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const closeModals = () => {
    setSelectedItem(null);
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setIsAlertModalOpen(false);
    setItemToEdit(null);
    setItemToDelete(null);
    setIsCreating(false);
  };

  const detailModalActions = selectedItem ? [
    { label: 'Удалить', onClick: () => handleDelete(selectedItem), type: 'danger' },
    { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'primary' },
  ] : [];

  const sortedEmployees = useMemo(() => {
    if (!isSortedAZ) return employees;
    return [...employees].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'ru')
    );
  }, [employees, isSortedAZ]);

  const sortedEmployeeNames = useMemo(() => {
    if (!employeeNames.length && employees.length) {
        return employees.map(e => `${e.firstName} ${e.lastName}`).sort((a, b) => a.localeCompare(b, 'ru'));
    }
    if (!isSortedAZ) return employeeNames;
    return [...employeeNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employeeNames, employees, isSortedAZ]);

  if (loading) return <LoadingText>Загрузка сотрудников...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Сотрудники</h2>
      <TopBarActions>
        <ActionButton onClick={openCreateModal}>Создать</ActionButton>
        <FilterDropdown>
          <FilterItem>
            <label>Показать только ФИО</label>
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
        {JSON.stringify(employees, null, 2)}
      </JsonModal>

      <DetailsModal 
        isOpen={!!selectedItem} 
        onClose={closeModals} 
        imageSrc={getAvatarForEmployee(selectedItem)} 
        imageAspectRatio="portrait" 
        footer={<ModalFooter actions={detailModalActions} />}
      >
        {selectedItem && (
          <>
            <h2>{selectedItem.firstName} {selectedItem.lastName}</h2>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Должность:</strong> {selectedItem.position?.name || 'N/A'}</p>
            <p><strong>Отдел:</strong> {selectedItem.position?.department?.name || 'N/A'}</p>
            <p><strong>Дата найма:</strong> {new Date(selectedItem.hireDate).toLocaleDateString()}</p>
            <p><strong>Зарплата:</strong> {selectedItem.salary} рублей</p>
            <FlexRow>
              <p><strong>Пол:</strong> {selectedItem.gender}</p>
              <p><strong>Дети:</strong> {selectedItem.childrenCount}</p>
            </FlexRow>
            <p><strong>Статус:</strong> {selectedItem.isActive ? 'Активен' : 'Неактивен'}</p>
          </>
        )}
      </DetailsModal>

      <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать сотрудника" : "Изменить сотрудника"}>
        <EmployeeForm 
            employee={isCreating ? null : itemToEdit} 
            positions={positions} 
            onSave={handleSave} 
            onCancel={closeModals} 
        />
      </FormModal>

      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

      <AlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        {...alertConfig} 
      />

      {showNamesOnly ? (
        <NameList>{sortedEmployeeNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : (
        <CardContainer>{sortedEmployees.map(emp => <EmployeeCard key={emp.id} employee={emp} onClick={() => setSelectedItem(emp)} />)}</CardContainer>
      )}
    </PageContainer>
  );
}