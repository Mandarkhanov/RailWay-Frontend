import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';
import TicketCard from '../components/TicketCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TicketForm from '../forms/TicketForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const ticketStatuses = ['забронирован', 'оплачен', 'возвращен', 'использован'];

const AnalyticsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f7f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid #dde;
    padding-bottom: 0.5rem;
  }
`;

const AnalyticsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: flex-end;
`;

const AnalyticsResult = styled.div`
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #3498db;
`;

const TicketFilters = ({ filters, onFilterChange, routes }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Маршрут</Label>
            <Select name="routeId" value={filters.routeId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Длина маршрута (км)</Label>
            <div style={{ display: 'flex', gap: '5px' }}>
                <Input style={{ width: '70px' }} type="number" name="minDistance" value={filters.minDistance || ''} onChange={onFilterChange} placeholder="От" />
                <Input style={{ width: '70px' }} type="number" name="maxDistance" value={filters.maxDistance || ''} onChange={onFilterChange} placeholder="До" />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Цена билета</Label>
            <div style={{ display: 'flex', gap: '5px' }}>
                <Input style={{ width: '80px' }} type="number" name="minPrice" value={filters.minPrice || ''} onChange={onFilterChange} placeholder="От" />
                <Input style={{ width: '80px' }} type="number" name="maxPrice" value={filters.maxPrice || ''} onChange={onFilterChange} placeholder="До" />
            </div>
        </FilterItem>
        <FilterItem>
            <Label>Статус билета</Label>
            <Select name="ticketStatus" value={filters.ticketStatus || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {ticketStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Дата покупки</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Input type="date" name="purchaseDateFrom" value={filters.purchaseDateFrom || ''} onChange={onFilterChange} />
                <Input type="date" name="purchaseDateTo" value={filters.purchaseDateTo || ''} onChange={onFilterChange} />
            </div>
        </FilterItem>
    </FilterDropdown>
);

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const [analyticsFilters, setAnalyticsFilters] = useState({ scheduleId: '', routeId: '', departureDate: '' });
    const [returnedCount, setReturnedCount] = useState(null);
    const [isAnalyticsLoading, setAnalyticsLoading] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
    const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});

    useEffect(() => {
        Promise.all([api.getRoutes(), api.getSchedules()])
            .then(([routesData, schedulesData]) => {
                setRoutes(routesData);
                setSchedules(schedulesData);
            }).catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
            const [data, countData] = await Promise.all([
                api.getTickets(activeFilters),
                api.getTicketCount(activeFilters)
            ]);
            setTickets(data);
            setTicketCount(countData.count);
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

    const handleAnalyticsFilterChange = (e) => {
        const { name, value } = e.target;
        setAnalyticsFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleGetReturnedCount = async () => {
        setAnalyticsLoading(true);
        setReturnedCount(null);
        try {
            const activeFilters = Object.fromEntries(Object.entries(analyticsFilters).filter(([, value]) => value));
            const data = await api.getReturnedTicketCount(activeFilters);
            setReturnedCount(data.count);
        } catch (e) {
            alert(`Ошибка при подсчете: ${e.message}`);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleSave = (formData) => {
        const action = isCreating ? api.createTicket : (id, data) => api.updateTicket(id, data);
        const id = isCreating ? null : selectedItem.id;
        action(id, formData)
            .then(() => {
                fetchData();
                closeModals();
            })
            .catch(e => alert(`Ошибка: ${e.message}`));
    };
    
    const openCreateModal = () => { setIsCreating(true); setSelectedItem(null); setIsFormModalOpen(true); };
    const openEditModal = (item) => { setIsCreating(false); setSelectedItem(item); setIsFormModalOpen(true); };
    const closeModals = () => { setSelectedItem(null); setIsFormModalOpen(false); setIsConfirmModalOpen(false); setIsCreating(false); setIsItemJsonModalOpen(false); };
    const openItemJsonModal = () => { setIsItemJsonModalOpen(true); };
    
    const detailModalActions = selectedItem ? [
        { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'primary' },
        { label: 'JSON', onClick: openItemJsonModal, type: 'secondary' },
    ] : [];

    return (
        <PageContainer>
            <PageHeader>
                <h2>Билеты ({loading ? '...' : ticketCount})</h2>
                <TopBarActions>
                    <ActionButton onClick={openCreateModal}>Создать</ActionButton>
                    <TicketFilters filters={filters} onFilterChange={handleFilterChange} routes={routes} />
                    <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
                </TopBarActions>
            </PageHeader>
            
            <AnalyticsContainer>
                <h3>Аналитика: Общее число сданных билетов</h3>
                <AnalyticsGrid>
                    <Select name="scheduleId" value={analyticsFilters.scheduleId} onChange={handleAnalyticsFilterChange}>
                        <option value="">Любой рейс</option>
                        {schedules.map(s => <option key={s.id} value={s.id}>№{s.trainNumber} - {s.route?.name}</option>)}
                    </Select>
                     <Select name="routeId" value={analyticsFilters.routeId} onChange={handleAnalyticsFilterChange}>
                        <option value="">Любой маршрут</option>
                        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Select>
                    <Input type="date" name="departureDate" value={analyticsFilters.departureDate} onChange={handleAnalyticsFilterChange} />
                    <ActionButton onClick={handleGetReturnedCount} disabled={isAnalyticsLoading}>
                        {isAnalyticsLoading ? 'Подсчет...' : 'Посчитать'}
                    </ActionButton>
                </AnalyticsGrid>
                {returnedCount !== null && (
                    <AnalyticsResult>Найдено сданных билетов: {returnedCount}</AnalyticsResult>
                )}
            </AnalyticsContainer>

            {loading ? (
                <LoadingText>Загрузка билетов...</LoadingText>
            ) : error ? (
                <ErrorText>Ошибка: {error}</ErrorText>
            ) : (
                 <CardContainer>{tickets.map(item => <TicketCard key={item.id} ticket={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
            )}

            <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
                {JSON.stringify(tickets, null, 2)}
            </JsonModal>

            <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
                {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
            </JsonModal>

            <DetailsModal isOpen={!!selectedItem && !isFormModalOpen} onClose={closeModals} imageSrc="/src/assets/ticket-placeholder.png" footer={<ModalFooter actions={detailModalActions} />}>
                {selectedItem && (
                    <>
                        <h2>Билет ID: {selectedItem.id}</h2>
                        <p><strong>Пассажир:</strong> {selectedItem.passenger?.lastName} {selectedItem.passenger?.firstName}</p>
                        <p><strong>Рейс:</strong> №{selectedItem.schedule?.trainNumber} ({selectedItem.schedule?.route?.name})</p>
                        <p><strong>Отправление:</strong> {new Date(selectedItem.schedule.departureTime).toLocaleString()}</p>
                        <p><strong>Место:</strong> Вагон №{selectedItem.seat?.car?.carNumber}, место №{selectedItem.seat?.seatNumber}</p>
                        <p><strong>Дата покупки:</strong> {new Date(selectedItem.purchaseDate).toLocaleString()}</p>
                        <p><strong>Цена:</strong> {selectedItem.price} руб.</p>
                        <p><strong>Статус:</strong> {selectedItem.ticketStatus}</p>
                    </>
                )}
            </DetailsModal>

            <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать билет" : "Изменить билет"}>
                <TicketForm ticket={isCreating ? null : selectedItem} onSave={handleSave} onCancel={closeModals} />
            </FormModal>
        </PageContainer>
    );
}