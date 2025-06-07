import { ClickableCard } from '../commonStyles';

export default function MedicalExaminationCard({ exam, onClick }) {
  const employeeName = exam.employee ? `${exam.employee.firstName} ${exam.employee.lastName}` : 'N/A';
  return (
    <ClickableCard isSuccess={exam.result} onClick={onClick}>
      <h3>Медосмотр: {employeeName}</h3>
      {exam.employee && exam.employee.position && (
        <p><strong>Должность:</strong> {exam.employee.position.name}</p>
      )}
      <p><strong>Дата осмотра:</strong> {exam.examinationDate ? new Date(exam.examinationDate).toLocaleDateString() : 'N/A'}</p>
    </ClickableCard>
  );
}