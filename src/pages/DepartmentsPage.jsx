import { useState, useEffect, useMemo } from 'react';
import DepartmentCard from '../components/DepartmentCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(null);
  const [departmentNames, setDepartmentNames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNamesOnly, setShowNamesOnly] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSortedAZ, setIsSortedAZ] = useState(false); // Состояние для сортировки

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = showNamesOnly ? 'http://localhost:8080/departments/names' : 'http://localhost:8080/departments';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (showNamesOnly) {
          setDepartmentNames(data);
        } else {
          setDepartments(data);
          setDepartmentNames(null);
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
    if (!departments) {
      fetch('http://localhost:8080/departments').then(res => res.json()).then(setDepartments).catch(console.error);
    }
  }, []);

  // Логика сортировки с помощью useMemo
  const sortedDepartments = useMemo(() => {
    if (!departments) return null;
    if (!isSortedAZ) return departments;
    return [...departments].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [departments, isSortedAZ]);

  const sortedDepartmentNames = useMemo(() => {
    if (!departmentNames) return null;
    if (!isSortedAZ) return departmentNames;
    return [...departmentNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [departmentNames, isSortedAZ]);

  if (loading && !(showNamesOnly && departmentNames)) return <LoadingText>Загрузка отделов...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке отделов: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Отделы</h2>
      <TopBarActions>
        <FilterDropdown>
          <FilterItem>
            <label htmlFor="names-filter-toggle">Показать только названия</label>
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
        {JSON.stringify(departments, null, 2)}
      </JsonModal>

      {selectedItem && (
        <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} imageSrc="/src/assets/department-placeholder.png" imageAspectRatio="16:9">
          <h2>{selectedItem.name}</h2>
          <p><strong>ID:</strong> {selectedItem.id}</p>
          <p><strong>Описание:</strong> {selectedItem.description || 'Нет описания'}</p>
        </DetailsModal>
      )}

      {showNamesOnly && sortedDepartmentNames ? (
        <NameList>{sortedDepartmentNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : sortedDepartments ? (
        <CardContainer>{sortedDepartments.map(dept => <DepartmentCard key={dept.id} department={dept} onClick={() => setSelectedItem(dept)} />)}</CardContainer>
      ) : null}

      {!(showNamesOnly ? sortedDepartmentNames : sortedDepartments) && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}