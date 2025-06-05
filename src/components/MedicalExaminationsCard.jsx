import React from 'react';
import { Card } from '../commonStyles';

export default function MedicalExaminationCard({ exam }) {
  const employeeName = exam.employee ? `${exam.employee.firstName} ${exam.employee.lastName}` : 'N/A';
  return (
    <Card>
      <h3>Медосмотр ID: {exam.id}</h3>
      <p><strong>Сотрудник:</strong> {employeeName}</p>
      {exam.employee && exam.employee.position && (
        <p><strong>Должность:</strong> {exam.employee.position.name}</p>
      )}
      <p><strong>Дата осмотра:</strong> {exam.examinationDate ? new Date(exam.examinationDate).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Результат:</strong> {exam.result ? 'Годен' : 'Не годен'}</p>
      <p><strong>Заметки:</strong> {exam.notes || 'Нет заметок'}</p>
    </Card>
  );
}