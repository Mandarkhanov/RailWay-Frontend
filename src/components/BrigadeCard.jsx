import { ClickableCard } from '../commonStyles';

export default function BrigadeCard({ brigade, onClick }) {
  return (
    <ClickableCard onClick={onClick}>
      <h3>{brigade.name}</h3>
      <p><strong>Отдел:</strong> {brigade.department ? brigade.department.name : 'N/A'}</p>
      <p><strong>Менеджер:</strong> {brigade.manager ? `${brigade.manager.firstName} ${brigade.manager.lastName}` : 'N/A'}</p>
      <p><strong>Сотрудников:</strong> {brigade.employeeCount}</p>
      <p><strong>Суммарная ЗП:</strong> {brigade.totalSalary != null ? `${new Intl.NumberFormat('ru-RU').format(brigade.totalSalary)} ₽` : 'N/A'}</p>
      <p><strong>Средняя ЗП:</strong> {brigade.averageSalary != null ? `${new Intl.NumberFormat('ru-RU').format(Math.round(brigade.averageSalary))} ₽` : 'N/A'}</p>
    </ClickableCard>
  );
}