import { ClickableCard } from '../commonStyles';

export default function EmployeeCard({ employee, onClick }) {
  return (
    <ClickableCard onClick={onClick} $isActive={employee.isActive}>
      <h3>{employee.firstName} {employee.lastName}</h3>
      <p><strong>Должность:</strong> {employee.position ? employee.position.name : 'N/A'}</p>
      <p><strong>Отдел:</strong> {employee.position && employee.position.department ? employee.position.department.name : 'N/A'}</p>
      <p><strong>Дата рождения:</strong> {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : 'N/A'}</p>
    </ClickableCard>
  );
}