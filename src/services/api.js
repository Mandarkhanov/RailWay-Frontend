const API_BASE_URL = 'http://localhost:8080';

// Общая функция для выполнения запросов
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
    // Если токен невалидный или его нет, выходим из системы
    localStorage.removeItem('token');
    window.location.href = '/login'; // Перезагружаем на страницу входа
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Что-то пошло не так');
  }
  
  // Для запросов без тела ответа (например, DELETE)
  if (response.status === 204) {
    return;
  }

  return response.json();
}

// Auth
export const login = (credentials) => request('/api/auth/login', { method: 'POST', body: credentials });
export const register = (userData) => request('/api/auth/register', { method: 'POST', body: userData });

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
export const getEmployees = () => request('/employees');
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
export const getMedicalExaminations = () => request('/medical-examinations');
export const createMedicalExamination = (data) => request('/medical-examinations', { method: 'POST', body: data });
export const updateMedicalExamination = (id, data) => request(`/medical-examinations/${id}`, { method: 'PUT', body: data });
export const deleteMedicalExamination = (id) => request(`/medical-examinations/${id}`, { method: 'DELETE' });