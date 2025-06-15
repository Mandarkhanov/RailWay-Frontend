import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';
import { FormGroup, Label, Select } from '../forms/formStyles';
import PassengerForm from '../forms/PassengerForm';
import FormModal from './FormModal';
import ModalFooter from './ModalFooter';
import PaymentProcessingModal from './PaymentProcessingModal'; // <-- Импортируем новый компонент

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AddPassengerButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.9em;
  padding: 5px;
  margin-top: 5px;
  align-self: flex-start;

  &:hover {
    text-decoration: underline;
  }
`;

const PassengerFormWrapper = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
`;

export default function PurchaseTicketModal({ isOpen, onClose, schedule }) {
    const [myPassengers, setMyPassengers] = useState([]);
    const [availableSeats, setAvailableSeats] = useState([]);
    
    const [selectedPassengerId, setSelectedPassengerId] = useState('');
    const [selectedSeatId, setSelectedSeatId] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [isAddingNewPassenger, setAddingNewPassenger] = useState(false);
    const [isPaymentProcessing, setPaymentProcessing] = useState(false); // <-- Новое состояние

    const fetchInitialData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const passengersPromise = api.getMyPassengers();
            const seatsPromise = api.getAvailableSeatsForSchedule(schedule.id);
            const [passengersData, seatsData] = await Promise.all([passengersPromise, seatsPromise]);
            setMyPassengers(passengersData);
            setAvailableSeats(seatsData);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            setSelectedPassengerId('');
            setSelectedSeatId('');
            setAddingNewPassenger(false);
            setPaymentProcessing(false);
        }
    }, [isOpen, schedule.id]);

    const handleAddNewPassenger = async (passengerData) => {
        try {
            const newPassenger = await api.addUserPassenger(passengerData);
            setMyPassengers(prev => [...prev, newPassenger]);
            setSelectedPassengerId(newPassenger.id);
            setAddingNewPassenger(false);
        } catch (e) {
            alert(`Ошибка при добавлении пассажира: ${e.message}`);
        }
    };

    // Функция, которая инициирует процесс "оплаты"
    const handleInitiatePurchase = () => {
        if (!selectedPassengerId || !selectedSeatId) {
            alert("Пожалуйста, выберите пассажира и место.");
            return;
        }
        setPaymentProcessing(true);
    };

    // Функция, которая будет вызвана из платежного модального окна для фактической покупки
    const handleConfirmPurchase = async () => {
        const ticketData = {
            scheduleId: schedule.id,
            passengerId: parseInt(selectedPassengerId, 10),
            seatId: parseInt(selectedSeatId, 10),
            price: schedule.basePrice,
            ticketStatus: 'оплачен',
            luggageId: null
        };
        // await api.createTicket(ticketData) будет вызван внутри, и если будет ошибка, она будет перехвачена
        await api.createTicket(ticketData);
    };

    const mainActions = [
        { label: 'Отмена', onClick: onClose, type: 'secondary' },
        { label: 'Купить билет', onClick: handleInitiatePurchase, type: 'primary' },
    ];

    if (!isOpen) return null;

    return (
        <>
            <FormModal isOpen={isOpen && !isPaymentProcessing} onClose={onClose} title={`Покупка билета на рейс №${schedule.trainNumber}`}>
                {isLoading ? (
                    <p>Загрузка данных...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Ошибка: {error}</p>
                ) : (
                    <ContentWrapper>
                        {!isAddingNewPassenger ? (
                            <>
                                <FormGroup>
                                    <Label htmlFor="passenger">Пассажир</Label>
                                    <Select id="passenger" value={selectedPassengerId} onChange={e => setSelectedPassengerId(e.target.value)}>
                                        <option value="">Выберите пассажира</option>
                                        {myPassengers.map(p => (
                                            <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
                                        ))}
                                    </Select>
                                    <AddPassengerButton type="button" onClick={() => setAddingNewPassenger(true)}>
                                        + Добавить нового пассажира
                                    </AddPassengerButton>
                                </FormGroup>
                                
                                <FormGroup>
                                    <Label htmlFor="seat">Место</Label>
                                    <Select id="seat" value={selectedSeatId} onChange={e => setSelectedSeatId(e.target.value)}>
                                        <option value="">Выберите место</option>
                                        {availableSeats.map(s => (
                                            <option key={s.id} value={s.id}>
                                                Вагон {s.car.carNumber} ({s.car.carType}), Место {s.seatNumber} ({s.seatType})
                                            </option>
                                        ))}
                                    </Select>
                                    {availableSeats.length === 0 && <small style={{color: 'red', marginTop: '5px'}}>Свободных мест нет</small>}
                                </FormGroup>
                            </>
                        ) : (
                            <PassengerFormWrapper>
                                <h3>Новый пассажир</h3>
                                <PassengerForm passenger={null} onSave={handleAddNewPassenger} onCancel={() => setAddingNewPassenger(false)} />
                            </PassengerFormWrapper>
                        )}
                        
                        {!isAddingNewPassenger && <ModalFooter actions={mainActions} />}
                    </ContentWrapper>
                )}
            </FormModal>

            <PaymentProcessingModal 
                isOpen={isPaymentProcessing}
                onConfirmPurchase={handleConfirmPurchase}
                onCloseAll={onClose}
            />
        </>
    );
}