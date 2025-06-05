import React from 'react';
import { Card } from '../commonStyles';

export default function DepartmentCard({ department }) {
  return (
    <Card>
      <h3>{department.name}</h3>
      <p><strong>ID:</strong> {department.id}</p>
      <p><strong>Описание:</strong> {department.description || 'Нет описания'}</p>
    </Card>
  );
}