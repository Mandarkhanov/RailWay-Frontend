import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import RouteCard from '../components/RouteCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import RouteForm from '../forms/RouteForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Select } from '../forms/formStyles';

const RouteFilters = ({ filters, onFilterChange, categories, stations }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Категория</Label>
            <Select name="categoryId" value={filters.categoryId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Направление (куда)</Label>
            <Select name="endStationId" value={filters.endStationId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
        </FilterItem>
    </FilterDropdown>
);

export default function RoutesPage() {
    const [routes, setRoutes] = useState([]);
    const [routeCount, setRouteCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const [selectedItem, setSelectedItem] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
    const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});

    useEffect(() => {
        Promise.all([
            api.getRouteCategories(),
            api.getStations()
        ]).then(([catData, staData]) => {
            setCategories(catData);
            setStations(staData);
        }).catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
            const [data, countData] = await Promise.all([
                api.getRoutes(activeFilters),
                api.getRouteCount(activeFilters)
            ]);
            setRoutes(data);
            setRouteCount(countData.count);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            message: `Создать новый маршрут "${formData.name}"?`,
            onConfirm: () => confirmCreate(formData),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmCreate = async (formData) => {
        try {
            await api.createRoute(formData);
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка при создании: ${e.message}`);
        }
    };

    const handleUpdate = (formData) => {
        setConfirmConfig({
            title: 'Подтвердите изменение',
            message: `Сохранить изменения для маршрута "${selectedItem.name}"?`,
            onConfirm: () => confirmUpdate(formData),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmUpdate = async (formData) => {
        try {
            await api.updateRoute(selectedItem.id, formData);
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка при обновлении: ${e.message}`);
        }
    };

    const handleDelete = (item) => {
        setConfirmConfig({
            title: 'Подтвердите удаление',
            message: `Удалить маршрут "${item.name}"?`,
            onConfirm: () => confirmDelete(item.id),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async (id) => {
        try {
            await api.deleteRoute(id);
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка при удалении: ${e.message}`);
        }
    };

    const openCreateModal = () => {
        setIsCreating(true);
        setSelectedItem(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsCreating(false);
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };

    const closeModals = () => {
        setSelectedItem(null);
        setIsFormModalOpen(false);
        setIsConfirmModalOpen(false);
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
                <h2>Маршруты ({loading ? '...' : routeCount})</h2>
                <TopBarActions>
                    <ActionButton onClick={openCreateModal}>Создать</ActionButton>
                    <RouteFilters 
                        filters={filters} 
                        onFilterChange={handleFilterChange}
                        categories={categories}
                        stations={stations}
                    />
                    <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
                </TopBarActions>
            </PageHeader>

            {loading ? (
                <LoadingText>Загрузка маршрутов...</LoadingText>
            ) : error ? (
                <ErrorText>Ошибка: {error}</ErrorText>
            ) : (
                <CardContainer>{routes.map(item => <RouteCard key={item.id} route={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
            )}

            <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
                {JSON.stringify(routes, null, 2)}
            </JsonModal>

            <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
                {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
            </JsonModal>

            <DetailsModal isOpen={!!selectedItem && !isFormModalOpen} onClose={closeModals} imageSrc="/src/assets/route-placeholder.png" footer={<ModalFooter actions={detailModalActions} />}>
                {selectedItem && (
                    <>
                        <h2>{selectedItem.name}</h2>
                        <p><strong>ID:</strong> {selectedItem.id}</p>
                        <p><strong>Начальная станция:</strong> {selectedItem.startStation?.name}</p>
                        <p><strong>Конечная станция:</strong> {selectedItem.endStation?.name}</p>
                        <p><strong>Дистанция:</strong> {selectedItem.distanceKm} км</p>
                        <p><strong>Категория:</strong> {selectedItem.category?.name || 'N/A'}</p>
                    </>
                )}
            </DetailsModal>

            <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать маршрут" : "Изменить маршрут"}>
                <RouteForm route={selectedItem} onSave={handleSave} onCancel={closeModals} />
            </FormModal>

            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

        </PageContainer>
    );
}