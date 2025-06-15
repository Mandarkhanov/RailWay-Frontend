import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import SeatCard from '../components/SeatCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import SeatForm from '../forms/SeatForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const getAvatarForSeat = (seat) => {
  if (!seat?.seatType) return '/src/assets/seat-placeholder.png';
  
  const type = seat.seatType.toLowerCase();
  if (type.includes('боковое')) return '/src/assets/seat-side.png';
  if (type.includes('верхнее')) return '/src/assets/seat-upper.png';
  if (type.includes('нижнее')) return '/src/assets/seat-lower.png';
  if (type.includes('окна')) return '/src/assets/seat-window.png';
  if (type.includes('прохода')) return '/src/assets/seat-aisle.png';

  return '/src/assets/seat-placeholder.png';
};

const SeatFilters = ({ filters, onFilterChange, schedules, routes }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Статус</Label>
            <Select name="isAvailable" value={filters.isAvailable ?? ''} onChange={onFilterChange}>
                <option value="">Все</option>
                <option value="true">Свободные</option>
                <option value="false">Выкупленные</option>
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Рейс</Label>
            <Select name="scheduleId" value={filters.scheduleId || ''} onChange={onFilterChange}>
                <option value="">Все рейсы</option>
                {schedules.map(s => <option key={s.id} value={s.id}>№{s.trainNumber} - {s.route?.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Маршрут</Label>
            <Select name="routeId" value={filters.routeId || ''} onChange={onFilterChange}>
                <option value="">Все маршруты</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Дата отправления</Label>
            <Input type="date" name="departureDate" value={filters.departureDate || ''} onChange={onFilterChange} />
        </FilterItem>
    </FilterDropdown>
);

export default function SeatsPage() {
    const [seats, setSeats] = useState([]);
    const [seatCount, setSeatCount] = useState(0);
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const [selectedItem, setSelectedItem] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const [isListJsonModalOpen, setIsListJsonModalOpen] = useState(false);
    const [isItemJsonModalOpen, setIsItemJsonModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    useEffect(() => {
        Promise.all([api.getSchedules(), api.getRoutes()])
            .then(([schedulesData, routesData]) => {
                setSchedules(schedulesData);
                setRoutes(routesData);
            }).catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
            const [data, countData] = await Promise.all([
                api.getFilteredSeats(activeFilters),
                api.getFilteredSeatsCount(activeFilters)
            ]);
            setSeats(data);
            setSeatCount(countData.count);
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
    
    const handleSave = async (formData) => {
        try {
            if (isCreating) {
                await api.createSeat(formData);
            } else {
                await api.updateSeat(selectedItem.id, formData);
            }
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка: ${e.message}`);
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
        setIsCreating(false);
        setIsItemJsonModalOpen(false);
    };

    const openItemJsonModal = () => {
        setIsItemJsonModalOpen(true);
    };

    const detailModalActions = selectedItem ? [
        { label: 'Изменить', onClick: () => openEditModal(selectedItem), type: 'primary' },
        { label: 'JSON', onClick: openItemJsonModal, type: 'secondary' },
    ] : [];
    
    return (
        <PageContainer>
            <PageHeader>
                <h2>Места ({loading ? '...' : seatCount})</h2>
                <TopBarActions>
                    <ActionButton onClick={openCreateModal}>Создать место</ActionButton>
                    <SeatFilters filters={filters} onFilterChange={handleFilterChange} schedules={schedules} routes={routes} />
                    <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
                </TopBarActions>
            </PageHeader>
            
            {loading ? (
                <LoadingText>Загрузка мест...</LoadingText>
            ) : error ? (
                <ErrorText>Ошибка: {error}</ErrorText>
            ) : (
                <CardContainer>
                    {seats.length > 0 ? (
                        seats.map(item => <SeatCard key={item.id} seat={item} onClick={() => setSelectedItem(item)} />)
                    ) : (
                        <p>Места по вашему запросу не найдены.</p>
                    )}
                </CardContainer>
            )}

            <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
                {JSON.stringify(seats, null, 2)}
            </JsonModal>

            <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
                {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
            </JsonModal>

            <DetailsModal
                isOpen={!!selectedItem && !isFormModalOpen}
                onClose={closeModals}
                imageSrc={getAvatarForSeat(selectedItem)}
                footer={<ModalFooter actions={detailModalActions} />}
            >
                {selectedItem && (
                    <>
                        <h2>Место {selectedItem.seatNumber}</h2>
                        <p><strong>ID:</strong> {selectedItem.id}</p>
                        <p><strong>Вагон:</strong> №{selectedItem.car?.carNumber} ({selectedItem.car?.carType})</p>
                        <p><strong>Тип места:</strong> {selectedItem.seatType}</p>
                        <p><strong>Статус:</strong> {selectedItem.isAvailable ? 'Свободно' : 'Выкуплено'}</p>
                        <p><strong>Особенности:</strong> {selectedItem.features || 'Нет'}</p>
                    </>
                )}
            </DetailsModal>

            <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Создать место" : "Изменить место"}>
                <SeatForm seat={isCreating ? null : selectedItem} onSave={handleSave} onCancel={closeModals} />
            </FormModal>
        </PageContainer>
    );
}