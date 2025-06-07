import { useState, useEffect, useMemo } from 'react';
import BrigadeCard from '../components/BrigadeCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal';
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

export default function BrigadesPage() {
  const [brigades, setBrigades] = useState(null);
  const [brigadeNames, setBrigadeNames] = useState(null);
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
        const endpoint = showNamesOnly ? 'http://localhost:8080/brigades/names' : 'http://localhost:8080/brigades';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (showNamesOnly) {
          setBrigadeNames(data);
        } else {
          setBrigades(data);
          setBrigadeNames(null);
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
    if (!brigades) {
      fetch('http://localhost:8080/brigades').then(res => res.json()).then(setBrigades).catch(console.error);
    }
  }, []);

  const sortedBrigades = useMemo(() => {
    if (!brigades) return null;
    if (!isSortedAZ) return brigades;
    return [...brigades].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [brigades, isSortedAZ]);

  const sortedBrigadeNames = useMemo(() => {
    if (!brigadeNames) return null;
    if (!isSortedAZ) return brigadeNames;
    return [...brigadeNames].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [brigadeNames, isSortedAZ]);

  if (loading && !(showNamesOnly && brigadeNames)) return <LoadingText>Загрузка бригад...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке бригад: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Бригады</h2>
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
        {JSON.stringify(brigades, null, 2)}
      </JsonModal>

      {selectedItem && (
        <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} imageSrc="/src/assets/brigade-placeholder.png" imageAspectRatio="16:9">
          <h2>{selectedItem.name}</h2>
          <p><strong>ID:</strong> {selectedItem.id}</p>
          <p><strong>Отдел:</strong> {selectedItem.department ? selectedItem.department.name : 'N/A'}</p>
          <p><strong>Менеджер:</strong> {selectedItem.manager ? `${selectedItem.manager.firstName} ${selectedItem.manager.lastName}` : 'N/A'}</p>
          {selectedItem.manager && selectedItem.manager.position && (
            <p><strong>Должность менеджера:</strong> {selectedItem.manager.position.name}</p>
          )}
        </DetailsModal>
      )}

      {showNamesOnly && sortedBrigadeNames ? (
        <NameList>{sortedBrigadeNames.map((name, index) => <li key={index}>{name}</li>)}</NameList>
      ) : sortedBrigades ? (
        <CardContainer>{sortedBrigades.map(brig => <BrigadeCard key={brig.id} brigade={brig} onClick={() => setSelectedItem(brig)} />)}</CardContainer>
      ) : null}
      
      {!(showNamesOnly ? sortedBrigadeNames : sortedBrigades) && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}