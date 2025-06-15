import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem, PageHeader } from './pageStyles';
import { FormGroup, Label, Input, Select } from '../forms/formStyles';

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

const EmployeeFilters = ({ filters, onFilterChange, departments, brigades }) => (
  <FilterDropdown>
    <FilterItem>
      <Label>Отдел</Label>
      <Select name="departmentId" value={filters.departmentId || ''} onChange={onFilterChange}>
        <option value="">Все</option>
        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </Select>
    </FilterItem>
    <FilterItem>
      <Label>Бригада</Label>
      <Select name="brigadeId" value={filters.brigadeId || ''} onChange={onFilterChange}>
        <option value="">Все</option>
        {brigades.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
    </FilterItem>
    <FilterItem>
      <Label>Стаж (лет, не менее)</Label>
      <Input type="number" name="minExperience" value={filters.minExperience || ''} onChange={onFilterChange} placeholder="Напр. 5" />
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
      <Label>Наличие детей</Label>
      <Select name="hasChildren" value={filters.hasChildren ?? ''} onChange={onFilterChange}>
        <option value="">Неважно</option>
        <option value="true">Есть</option>
        <option value="false">Нет</option>
      </Select>
    </FilterItem>
    <FilterItem>
        <Label>Зарплата (от и до)</Label>
        <div style={{display: 'flex', gap: '5px'}}>
            <Input style={{width: '80px'}} type="number" name="minSalary" value={filters.minSalary || ''} onChange={onFilterChange} placeholder="50000" />
            <Input style={{width: '80px'}} type="number" name="maxSalary" value={filters.maxSalary || ''} onChange={onFilterChange} placeholder="100000" />
        </div>
    </FilterItem>
    {/* ===== НОВЫЙ ФИЛЬТР ===== */}
    <FilterItem>
        <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', fontWeight: 'normal', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="isManager" 
              checked={filters.isManager || false} 
              onChange={onFilterChange}
            />
            <span>Только начальники</span>
        </label>
    </FilterItem>
  </FilterDropdown>
);


export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [brigades, setBrigades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({});
    const [isSortedAZ, setIsSortedAZ] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
  
    const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
    const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});

    useEffect(() => {
        Promise.all([
            api.getPositions(),
            api.getDepartments(),
            api.getBrigades()
        ]).then(([positionsData, departmentsData, brigadesData]) => {
            setPositions(positionsData);
            setDepartments(departmentsData);
            setBrigades(brigadesData);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchFilteredEmployees = async () => {
            setLoading(true);
            setError(null);

            const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            try {
                const [employeesData, countData] = await Promise.all([
                    api.getEmployees(activeFilters),
                    api.getEmployeeCount(activeFilters),
                ]);
                setEmployees(employeesData);
                setEmployeeCount(countData.count);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredEmployees();
    }, [filters]);
    
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFilterValue = type === 'checkbox' ? checked : value;
        setFilters(prev => ({ ...prev, [name]: newFilterValue }));
    };

    const sortedEmployees = useMemo(() => {
        if (!isSortedAZ) return employees;
        return [...employees].sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'ru')
        );
    }, [employees, isSortedAZ]);

    const refetchData = useCallback(() => {
        setFilters(prev => ({...prev}));
    }, []);
    
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
        isCreating ? handleCreate(formData) : handleUpdate(formData);
    };
    
    const handleCreate = (formData) => {
        const fullDto = { 
            ...formData, 
            birthDate: '1990-01-01', gender: 'М', childrenCount: 0,
            salary: parseFloat(formData.salary) || null,
            positionId: parseInt(formData.positionId, 10)
        };
        setConfirmConfig({
            title: 'Подтвердите создание',
            message: `Создать нового сотрудника "${formData.firstName} ${formData.lastName}"?`,
            onConfirm: async () => {
                try {
                    await api.createEmployee(fullDto);
                    refetchData();
                    closeModals();
                } catch(e) { showAlert(e.message); }
            },
        });
        setIsFormModalOpen(false);
        setIsConfirmModalOpen(true);
    };
  
    const handleUpdate = (formData) => {
        const dtoToSend = {
            firstName: formData.firstName, lastName: formData.lastName,
            birthDate: itemToEdit.birthDate, gender: itemToEdit.gender,
            childrenCount: itemToEdit.childrenCount, hireDate: formData.hireDate,
            positionId: parseInt(formData.positionId, 10),
            salary: parseFloat(formData.salary) || null,
            isActive: formData.isActive,
        };
        setConfirmConfig({
            title: 'Подтвердите изменение',
            message: `Сохранить изменения для сотрудника "${itemToEdit.firstName} ${itemToEdit.lastName}"?`,
            onConfirm: async () => {
                try {
                    await api.updateEmployee(itemToEdit.id, dtoToSend);
                    refetchData();
                    closeModals();
                } catch(e) { showAlert(e.message); }
            },
        });
        setIsFormModalOpen(false);
        setIsConfirmModalOpen(true);
    };
    
    const handleDelete = (employee) => {
        setConfirmConfig({
            title: 'Подтвердите удаление',
            message: `Удалить сотрудника "${employee.firstName} ${employee.lastName}"?`,
            onConfirm: async () => {
                try {
                    await api.deleteEmployee(employee.id);
                    refetchData();
                    closeModals();
                } catch(e) { showAlert(e.message); }
            },
        });
        setIsConfirmModalOpen(true);
    };

    const showAlert = (message) => {
        setConfirmConfig({});
        setIsConfirmModalOpen(false);
        setAlertConfig({ title: "Ошибка", message });
        setIsAlertModalOpen(true);
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

    return (
    <PageContainer>
        <PageHeader>
        <h2>Сотрудники ({loading ? '...' : employeeCount})</h2>
        <TopBarActions>
            <ActionButton onClick={openCreateModal}>Создать</ActionButton>
            <EmployeeFilters filters={filters} onFilterChange={handleFilterChange} departments={departments} brigades={brigades} />
            <FilterItem>
              <label>Сортировать А-Я</label>
              <input type="checkbox" checked={isSortedAZ} onChange={(e) => setIsSortedAZ(e.target.checked)} />
            </FilterItem>
            <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
        </TopBarActions>
        </PageHeader>
        
        {loading ? (
            <LoadingText>Загрузка сотрудников...</LoadingText>
        ) : error ? (
            <ErrorText>Ошибка при загрузке: {error}</ErrorText>
        ) : (
            <CardContainer>
                {sortedEmployees && sortedEmployees.map(emp => 
                    <EmployeeCard key={emp.id} employee={emp} onClick={() => setSelectedItem(emp)} />
                )}
            </CardContainer>
        )}
        
        <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
            {JSON.stringify(employees, null, 2)}
        </JsonModal>

        <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
            {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
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
                <p><strong>Дата рождения:</strong> {selectedItem.birthDate ? new Date(selectedItem.birthDate).toLocaleDateString() : 'N/A'}</p>
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
            onClose={closeModals} 
            {...alertConfig} 
        />
    </PageContainer>
    );
}