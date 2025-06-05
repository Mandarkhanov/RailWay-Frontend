import React from 'react';
import { Card } from '../commonStyles';

export default function PositionCard({ position }) {
  return (
    <Card>
      <h3>{position.name}</h3>
      <p><strong>ID:</strong> {position.id}</p>
      <p><strong>Отдел:</strong> {position.department ? position.department.name : 'N/A'}</p>
      <p><strong>Мин. зарплата:</strong> {position.minSalary !== null ? position.minSalary : 'N/A'}</p>
      <p><strong>Макс. зарплата:</strong> {position.maxSalary !== null ? position.maxSalary : 'N/A'}</p>
      <p><strong>Описание:</strong> {position.description || 'Нет описания'}</p>
    </Card>
  );
}