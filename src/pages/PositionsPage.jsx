import { useState, useEffect, useMemo } from 'react';
import PositionCard from '../components/PositionCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

export default function PositionsPage() {
  const [positions, setPositions] = useState(null);
  const [positionNames, setPositionNames] = useState(null);
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
        const endpoint = showNamesOnly ? 'http://localhost:8080/positions/names' : 'http://localhost:8080/positions';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (showNamesOnly) {
          setPositionNames(data);
        } else {
          setPositions(data);
          setPositionNames(null);
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
    if (!positions) {
      fetch('http://localhost:8080/positions').then(res => res.json()).then(setPositions).catch(console.error);
    }
  }, []);

  const sortedPositions = useMemo(() => {
    if (!positions) return null;
    if (!isSortedAZ) return positions;
    return [...positions].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [positions, isSortedAZ]);

  const sortedPositionNames = useMemo(() => {
    if (!positionNames) return null;
    if (!isSortedAZ) return positionNames;
    return [...positionNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [positionNames, isSortedAZ]);

  if (loading && !(showNamesOnly && positionNames)) return <LoadingText>Загрузка должностей...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке должностей: {error}</ErrorText>;
  
  return (
    <PageContainer>
      <h2>Должности</h2>
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
        {JSON.stringify(positions, null, 2)}
      </JsonModal>

      {selectedItem && (
        <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} imageSrc="/src/assets/position-placeholder.png" imageAspectRatio="portrait">
          <h2>{selectedItem.name}</h2>
          <p><strong>ID:</strong> {selectedItem.id}</p>
          <p><strong>Отдел:</strong> {selectedItem.department ? selectedItem.department.name : 'N/A'}</p>
          <p><strong>Зарплата:</strong> {selectedItem.minSalary || 'N/A'} - {selectedItem.maxSalary || 'N/A'} рублей</p>
          <p><strong>Описание:</strong> {selectedItem.description || 'Нет описания'}</p>
        </DetailsModal>
      )}

      {showNamesOnly && sortedPositionNames ? (
        <NameList>{sortedPositionNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : sortedPositions ? (
        <CardContainer>{sortedPositions.map(pos => <PositionCard key={pos.id} position={pos} onClick={() => setSelectedItem(pos)} />)}</CardContainer>
      ) : null}
      
      {!(showNamesOnly ? sortedPositionNames : sortedPositions) && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}