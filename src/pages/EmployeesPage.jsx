import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import EmployeeCard from '../components/EmployeeCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const getAvatarForEmployee = (employee) => {
  if (!employee || !employee.gender) return '/src/assets/employee-placeholder.png';
  const gender = employee.gender.toLowerCase();
  if (gender === 'мужской' || gender === 'male' || gender === 'м') return '/src/assets/male-employee-placeholder.png';
  if (gender === 'женский' || gender === 'female' || gender === 'ж') return '/src/assets/female-employee-placeholder.png';
  return '/src/assets/employee-placeholder.png';
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(null);
  const [employeeNames, setEmployeeNames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNamesOnly, setShowNamesOnly] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSortedAZ, setIsSortedAZ] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = showNamesOnly ? 'http://localhost:8080/employees/names' : 'http://localhost:8080/employees';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (showNamesOnly) {
          setEmployeeNames(data);
        } else {
          setEmployees(data);
          setEmployeeNames(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showNamesOnly]);

  useEffect(() => {
    if (!employees) {
      fetch('http://localhost:8080/employees').then(res => res.json()).then(setEmployees).catch(console.error);
    }
  }, []);

  const sortedEmployees = useMemo(() => {
    if (!employees) return null;
    if (!isSortedAZ) return employees;
    return [...employees].sort((a, b) => 
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'ru')
    );
  }, [employees, isSortedAZ]);

  const sortedEmployeeNames = useMemo(() => {
    if (!employeeNames) return null;
    if (!isSortedAZ) return employeeNames;
    return [...employeeNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employeeNames, isSortedAZ]);

  if (loading && !(showNamesOnly && employeeNames)) return <LoadingText>Загрузка сотрудников...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке сотрудников: {error}</ErrorText>;
  
  return (
    <PageContainer>
      <h2>Сотрудники</h2>
      <TopBarActions>
        <FilterDropdown>
          <FilterItem>
            <label htmlFor="names-filter-toggle">Показать только ФИО</label>
            <input type="checkbox" id="names-filter-toggle" checked={showNamesOnly} onChange={() => setShowNamesOnly(p => !p)} />
          </FilterItem>
          <FilterItem>
            <label htmlFor="sort-az-toggle">Сортировать А-Я</label>
            <input type="checkbox" id="sort-az-toggle" checked={isSortedAZ} onChange={() => setIsSortedAZ(p => !p)} />
          </FilterItem>
        </FilterDropdown>
        <ActionButton onClick={() => setIsJsonModalOpen(true)}>JSON</ActionButton>
      </TopBarActions>

      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)}>
        {JSON.stringify(employees, null, 2)}
      </JsonModal>
      
      {selectedItem && (
        <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} imageSrc={getAvatarForEmployee(selectedItem)} imageAspectRatio="portrait">
          <h2>{selectedItem.firstName} {selectedItem.lastName}</h2>
          <p><strong>ID:</strong> {selectedItem.id}</p>
          <p><strong>Должность:</strong> {selectedItem.position ? selectedItem.position.name : 'N/A'}</p>
          <p><strong>Отдел:</strong> {selectedItem.position && selectedItem.position.department ? selectedItem.position.department.name : 'N/A'}</p>
          <p><strong>Дата найма:</strong> {selectedItem.hireDate ? new Date(selectedItem.hireDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Зарплата:</strong> {selectedItem.salary !== null ? selectedItem.salary : 'N/A'} рублей</p>
          <FlexRow>
            <p><strong>Пол:</strong> {selectedItem.gender || 'N/A'}</p>
            <p><strong>Дети:</strong> {selectedItem.childrenCount !== null ? selectedItem.childrenCount : 'N/A'}</p>
          </FlexRow>
          <p><strong>Статус:</strong> {selectedItem.isActive ? 'Активен' : 'Неактивен'}</p>
        </DetailsModal>
      )}

      {showNamesOnly && sortedEmployeeNames ? (
        <NameList>{sortedEmployeeNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : sortedEmployees ? (
        <CardContainer>{sortedEmployees.map(emp => <EmployeeCard key={emp.id} employee={emp} onClick={() => setSelectedItem(emp)} />)}</CardContainer>
      ) : null}

      {!(showNamesOnly ? sortedEmployeeNames : sortedEmployees) && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}