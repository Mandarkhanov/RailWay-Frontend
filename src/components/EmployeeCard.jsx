import React from 'react';
import { Card } from '../commonStyles';

export default function EmployeeCard({ employee }) {
  return (
    <Card>
      <h3>{employee.firstName} {employee.lastName}</h3>
      <p><strong>ID:</strong> {employee.id}</p>
      <p><strong>Должность:</strong> {employee.position ? employee.position.name : 'N/A'}</p>
      <p><strong>Отдел:</strong> {employee.position && employee.position.department ? employee.position.department.name : 'N/A'}</p>
      <p><strong>Дата найма:</strong> {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Зарплата:</strong> {employee.salary !== null ? employee.salary : 'N/A'}</p>
      <p><strong>Пол:</strong> {employee.gender || 'N/A'}</p>
      <p><strong>Дети:</strong> {employee.childrenCount !== null ? employee.childrenCount : 'N/A'}</p>
      <p><strong>Активен:</strong> {employee.isActive ? 'Да' : 'Нет'}</p>
    </Card>
  );
}