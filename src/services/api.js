const API_BASE_URL = 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const { body, ...customOptions } = options;
  const token = localStorage.getItem('token');
  
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method: body ? 'POST' : 'GET',
    ...customOptions,
    headers: {
      ...headers,
      ...customOptions.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Что-то пошло не так');
  }
  
  if (response.status === 204) {
    return;
  }

  return response.json();
}

// Auth
export const login = (credentials) => request('/api/auth/login', { method: 'POST', body: credentials });
export const register = (userData) => request('/api/auth/register', { method: 'POST', body: userData });

// User-specific
export const getMyPassengers = () => request('/api/user/passengers');
export const addUserPassenger = (passengerData) => request('/api/user/passengers', { method: 'POST', body: passengerData });
export const getMyTickets = () => request('/api/user/tickets');


// Departments
export const getDepartments = () => request('/departments');
export const createDepartment = (data) => request('/departments', { method: 'POST', body: data });
export const updateDepartment = (id, data) => request(`/departments/${id}`, { method: 'PUT', body: data });
export const deleteDepartment = (id) => request(`/departments/${id}`, { method: 'DELETE' });
export const getDepartmentNames = () => request('/departments/names');

// Positions
export const getPositions = () => request('/positions');
export const createPosition = (data) => request('/positions', { method: 'POST', body: data });
export const updatePosition = (id, data) => request(`/positions/${id}`, { method: 'PUT', body: data });
export const deletePosition = (id) => request(`/positions/${id}`, { method: 'DELETE' });
export const getPositionNames = () => request('/positions/names');

// Employees
export const getEmployees = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/employees?${query}`);
};
export const getEmployeeCount = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/employees/count?${query}`);
};
export const createEmployee = (data) => request('/employees', { method: 'POST', body: data });
export const updateEmployee = (id, data) => request(`/employees/${id}`, { method: 'PUT', body: data });
export const deleteEmployee = (id) => request(`/employees/${id}`, { method: 'DELETE' });
export const getEmployeeNames = () => request('/employees/names');

// Brigades
export const getBrigades = () => request('/brigades');
export const createBrigade = (data) => request('/brigades', { method: 'POST', body: data });
export const updateBrigade = (id, data) => request(`/brigades/${id}`, { method: 'PUT', body: data });
export const deleteBrigade = (id) => request(`/brigades/${id}`, { method: 'DELETE' });
export const getBrigadeNames = () => request('/brigades/names');

// Medical Examinations
export const getMedicalExaminations = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/medical-examinations?${query}`);
};
export const getMedicalExaminationCount = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/medical-examinations/count?${query}`);
};
export const createMedicalExamination = (data) => request('/medical-examinations', { method: 'POST', body: data });
export const updateMedicalExamination = (id, data) => request(`/medical-examinations/${id}`, { method: 'PUT', body: data });
export const deleteMedicalExamination = (id) => request(`/medical-examinations/${id}`, { method: 'DELETE' });

// Train Types (dependency for Schedule)
export const getTrainTypes = () => request('/train-types');

// Route Categories (dependency for Route)
export const getRouteCategories = () => request('/route-categories');

// Trains
export const getTrains = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/trains?${query}`);
};
export const getTrainCount = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/trains/count?${query}`);
};
export const createTrain = (data) => request('/trains', { method: 'POST', body: data });
export const updateTrain = (id, data) => request(`/trains/${id}`, { method: 'PUT', body: data });
export const deleteTrain = (id) => request(`/trains/${id}`, { method: 'DELETE' });
export const getTrainPersonnel = (id) => request(`/trains/${id}/personnel`);

// Cars
export const getCars = () => request('/cars');
export const createCar = (data) => request('/cars', { method: 'POST', body: data });
export const updateCar = (id, data) => request(`/cars/${id}`, { method: 'PUT', body: data });
export const deleteCar = (id) => request(`/cars/${id}`, { method: 'DELETE' });

// Seats
export const getSeats = () => request('/seats');
export const getFilteredSeats = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/seats/filtered?${query}`);
};
export const getFilteredSeatsCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/seats/filtered/count?${query}`);
};
export const createSeat = (data) => request('/seats', { method: 'POST', body: data });
export const updateSeat = (id, data) => request(`/seats/${id}`, { method: 'PUT', body: data });
export const deleteSeat = (id) => request(`/seats/${id}`, { method: 'DELETE' });
export const getAvailableSeatsForSchedule = (scheduleId) => request(`/schedules/${scheduleId}/seats/available`);

// Stations
export const getStations = () => request('/stations');
export const createStation = (data) => request('/stations', { method: 'POST', body: data });
export const updateStation = (id, data) => request(`/stations/${id}`, { method: 'PUT', body: data });
export const deleteStation = (id) => request(`/stations/${id}`, { method: 'DELETE' });

// Routes
export const getRoutes = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/routes?${query}`);
};
export const getRouteCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/routes/count?${query}`);
};
export const createRoute = (data) => request('/routes', { method: 'POST', body: data });
export const updateRoute = (id, data) => request(`/routes/${id}`, { method: 'PUT', body: data });
export const deleteRoute = (id) => request(`/routes/${id}`, { method: 'DELETE' });

// RouteStops
export const getRouteStops = () => request('/route-stops');
export const createRouteStop = (data) => request('/route-stops', { method: 'POST', body: data });
export const updateRouteStop = (id, data) => request(`/route-stops/${id}`, { method: 'PUT', body: data });
export const deleteRouteStop = (id) => request(`/route-stops/${id}`, { method: 'DELETE' });

// Schedules
export const getSchedules = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/schedules?${query}`);
};
export const getScheduleCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/schedules/count?${query}`);
};
export const createSchedule = (data) => request('/schedules', { method: 'POST', body: data });
export const updateSchedule = (id, data) => request(`/schedules/${id}`, { method: 'PUT', body: data });
export const deleteSchedule = (id) => request(`/schedules/${id}`, { method: 'DELETE' });
export const findSchedules = (from, to) => request(`/schedules/search?fromStationName=${encodeURIComponent(from)}&toStationName=${encodeURIComponent(to)}`);

// Tickets
export const getTickets = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/tickets?${query}`);
};
export const getTicketCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/tickets/count?${query}`);
};
export const getReturnedTicketCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/tickets/returned/count?${query}`);
};
export const createTicket = (data) => request('/tickets', { method: 'POST', body: data });
export const updateTicket = (id, data) => request(`/tickets/${id}`, { method: 'PUT', body: data });
export const deleteTicket = (id) => request(`/tickets/${id}`, { method: 'DELETE' });

// Passengers
export const getPassengers = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/passengers?${query}`);
};
export const getPassengerCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/passengers/count?${query}`);
};
export const createPassenger = (data) => request('/passengers', { method: 'POST', body: data });
export const updatePassenger = (id, data) => request(`/passengers/${id}`, { method: 'PUT', body: data });
export const deletePassenger = (id) => request(`/passengers/${id}`, { method: 'DELETE' });

// Luggage
export const getLuggage = () => request('/luggage');
export const createLuggage = (data) => request('/luggage', { method: 'POST', body: data });
export const updateLuggage = (id, data) => request(`/luggage/${id}`, { method: 'PUT', body: data });
export const deleteLuggage = (id) => request(`/luggage/${id}`, { method: 'DELETE' });

// Maintenances
export const getMaintenances = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/maintenances?${query}`);
};
export const getMaintenanceCount = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/maintenances/count?${query}`);
};
export const createMaintenance = (data) => request('/maintenances', { method: 'POST', body: data });
export const updateMaintenance = (id, data) => request(`/maintenances/${id}`, { method: 'PUT', body: data });
export const deleteMaintenance = (id) => request(`/maintenances/${id}`, { method: 'DELETE' });

// Admin
export const executeSql = (sqlString) => request('/api/admin/sql', { 
    method: 'POST', 
    body: { sql: sqlString } 
});