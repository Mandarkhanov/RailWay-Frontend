import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import PassengerCard from '../components/PassengerCard';
import JsonModal from '../components/JsonModal';
import DetailsModal from '../components/DetailsModal';
import FormModal from '../components/FormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import PassengerForm from '../forms/PassengerForm';
import ModalFooter from '../components/ModalFooter';
import FilterDropdown from '../components/FilterDropdown';
import { CardContainer } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, PageHeader, FilterItem } from './pageStyles';
import { Label, Input, Select } from '../forms/formStyles';

const getAvatarForPassenger = (passenger) => {
    if (!passenger?.gender) return '/src/assets/employee-placeholder.png';
    const gender = passenger.gender.toLowerCase();
    if (gender === 'м') return '/src/assets/passenger-male.png';
    if (gender === 'ж') return '/src/assets/passenger-female.png';
    return '/src/assets/employee-placeholder.png';
};

const PassengerFilters = ({ filters, onFilterChange, schedules }) => (
    <FilterDropdown>
        <FilterItem>
            <Label>Рейс</Label>
            <Select name="scheduleId" value={filters.scheduleId || ''} onChange={onFilterChange}>
                <option value="">Все</option>
                {schedules.map(s => <option key={s.id} value={s.id}>№{s.trainNumber} - {s.route?.name}</option>)}
            </Select>
        </FilterItem>
        <FilterItem>
            <Label>Дата отправления</Label>
            <Input type="date" name="departureDate" value={filters.departureDate || ''} onChange={onFilterChange} />
        </FilterItem>
        <FilterItem>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    name="departedAbroad"
                    checked={!!filters.departedAbroad}
                    onChange={onFilterChange}
                    disabled={!filters.departureDate}
                />
                Уехали за границу
            </label>
        </FilterItem>
        <FilterItem>
            <Label>Багаж</Label>
            <Select name="hasLuggage" value={filters.hasLuggage ?? ''} onChange={onFilterChange}>
                <option value="">Неважно</option>
                <option value="true">С багажом</option>
                <option value="false">Без багажа</option>
            </Select>
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
            <div style={{ display: 'flex', gap: '5px' }}>
                <Input style={{ width: '60px' }} type="number" name="minAge" value={filters.minAge || ''} onChange={onFilterChange} placeholder="От" />
                <Input style={{ width: '60px' }} type="number" name="maxAge" value={filters.maxAge || ''} onChange={onFilterChange} placeholder="До" />
            </div>
        </FilterItem>
    </FilterDropdown>
);

export default function PassengersPage() {
    const [passengers, setPassengers] = useState([]);
    const [passengerCount, setPassengerCount] = useState(0);
    const [schedules, setSchedules] = useState([]);
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
        api.getSchedules().then(setSchedules).catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
            const [data, countData] = await Promise.all([
                api.getPassengers(activeFilters),
                api.getPassengerCount(activeFilters)
            ]);
            setPassengers(data);
            setPassengerCount(countData.count);
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
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = (formData) => {
        isCreating ? handleCreate(formData) : handleUpdate(formData);
    };

    const handleCreate = (formData) => {
        setConfirmConfig({
            title: 'Подтвердите создание',
            message: `Создать нового пассажира ${formData.lastName} ${formData.firstName}?`,
            onConfirm: () => confirmCreate(formData),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmCreate = async (formData) => {
        try {
            await api.createPassenger(formData);
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка при создании: ${e.message}`);
        }
    };

    const handleUpdate = (formData) => {
        setConfirmConfig({
            title: 'Подтвердите изменение',
            message: `Сохранить изменения для пассажира ${selectedItem.lastName} ${selectedItem.firstName}?`,
            onConfirm: () => confirmUpdate(formData),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmUpdate = async (formData) => {
        try {
            await api.updatePassenger(selectedItem.id, formData);
            fetchData();
            closeModals();
        } catch (e) {
            alert(`Ошибка при обновлении: ${e.message}`);
        }
    };

    const handleDelete = (item) => {
        setConfirmConfig({
            title: 'Подтвердите удаление',
            message: `Удалить пассажира ${item.lastName} ${item.firstName}?`,
            onConfirm: () => confirmDelete(item.id),
        });
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async (id) => {
        try {
            await api.deletePassenger(id);
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
                <h2>Пассажиры ({loading ? '...' : passengerCount})</h2>
                <TopBarActions>
                    <ActionButton onClick={openCreateModal}>Создать</ActionButton>
                    <PassengerFilters filters={filters} onFilterChange={handleFilterChange} schedules={schedules} />
                    <ActionButton onClick={() => setIsListJsonModalOpen(true)}>JSON</ActionButton>
                </TopBarActions>
            </PageHeader>

            {loading ? (
                <LoadingText>Загрузка пассажиров...</LoadingText>
            ) : error ? (
                <ErrorText>Ошибка: {error}</ErrorText>
            ) : (
                <CardContainer>{passengers.map(item => <PassengerCard key={item.id} passenger={item} onClick={() => setSelectedItem(item)} />)}</CardContainer>
            )}


            <JsonModal isOpen={isListJsonModalOpen} onClose={() => setIsListJsonModalOpen(false)}>
                {JSON.stringify(passengers, null, 2)}
            </JsonModal>

            <JsonModal isOpen={isItemJsonModalOpen} onClose={closeModals}>
                {selectedItem ? JSON.stringify(selectedItem, null, 2) : ''}
            </JsonModal>

            <DetailsModal
                isOpen={!!selectedItem && !isFormModalOpen}
                onClose={closeModals}
                imageSrc={getAvatarForPassenger(selectedItem)}
                footer={<ModalFooter actions={detailModalActions} />}
            >
                {selectedItem && (
                    <>
                        <h2>{selectedItem.lastName} {selectedItem.firstName} {selectedItem.middleName || ''}</h2>
                        <p><strong>ID:</strong> {selectedItem.id}</p>
                        <p><strong>Дата рождения:</strong> {selectedItem.birthDate ? new Date(selectedItem.birthDate).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Пол:</strong> {selectedItem.gender}</p>
                        <p><strong>Паспорт:</strong> {selectedItem.passportSeries} {selectedItem.passportNumber}</p>
                        <p><strong>Телефон:</strong> {selectedItem.phoneNumber || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedItem.email || 'N/A'}</p>
                    </>
                )}
            </DetailsModal>

            <FormModal isOpen={isFormModalOpen} onClose={closeModals} title={isCreating ? "Добавить пассажира" : "Изменить пассажира"}>
                <PassengerForm passenger={selectedItem} onSave={handleSave} onCancel={closeModals} />
            </FormModal>

            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModals} {...confirmConfig} />

        </PageContainer>
    );
}