import { useState, useEffect } from 'react';
import MedicalExaminationCard from '../components/MedicalExaminationsCard';
import JsonModal from '../components/JsonModal';
import FilterDropdown from '../components/FilterDropdown';
import DetailsModal from '../components/DetailsModal'; // Импортируем модальное окно
import { CardContainer, NameList } from '../commonStyles';
import { PageContainer, LoadingText, ErrorText, TopBarActions, ActionButton, FilterItem } from './pageStyles';

export default function MedicalExaminationsPage() {
  const [examinations, setExaminations] = useState(null);
  const [examinationSummaries, setExaminationSummaries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummariesOnly, setShowSummariesOnly] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null); // Состояние для выбранного осмотра

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8080/medical-examinations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExaminations(data);
        if (data) {
            const summaries = data.map(exam =>
                `Осмотр ID ${exam.id} для ${exam.employee ? exam.employee.firstName + ' ' + exam.employee.lastName : 'Неизвестный сотрудник'}`
            );
            setExaminationSummaries(summaries);
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch medical examinations:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для получения аватара в зависимости от результата осмотра
  const getAvatarForExam = (exam) => {
    if (!exam) return '/src/assets/employee-placeholder.png'; // Запасной вариант
    return exam.result 
        ? '/src/assets/healthy-worker.png' // Путь к фото для здорового
        : '/src/assets/sick-worker.png';      // Путь к фото для больного
  };

  if (loading) return <LoadingText>Загрузка медосмотров...</LoadingText>;
  if (error) return <ErrorText>Ошибка при загрузке медосмотров: {error}</ErrorText>;

  return (
    <PageContainer>
      <h2>Медицинские осмотры</h2>
      <TopBarActions>
        <FilterDropdown>
          <FilterItem>
            <label htmlFor="summaries-filter-toggle">Показать только сводку</label>
            <input 
              type="checkbox" 
              id="summaries-filter-toggle"
              checked={showSummariesOnly}
              onChange={() => setShowSummariesOnly(p => !p)}
            />
          </FilterItem>
        </FilterDropdown>
        <ActionButton onClick={() => setIsJsonModalOpen(true)}>JSON</ActionButton>
      </TopBarActions>

      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)}>
        {JSON.stringify(examinations, null, 2)}
      </JsonModal>

      {/* Модальное окно для детальной информации */}
      {selectedExam && (
        <DetailsModal 
          isOpen={!!selectedExam} 
          onClose={() => setSelectedExam(null)} 
          imageSrc={getAvatarForExam(selectedExam)} 
          imageAspectRatio="portrait"
        >
          <h2>Медосмотр: {selectedExam.employee ? `${selectedExam.employee.firstName} ${selectedExam.employee.lastName}` : 'N/A'}</h2>
          <p><strong>ID осмотра:</strong> {selectedExam.id}</p>
          {selectedExam.employee && (
            <>
              <p><strong>ID сотрудника:</strong> {selectedExam.employee.id}</p>
              <p><strong>Должность:</strong> {selectedExam.employee.position ? selectedExam.employee.position.name : 'N/A'}</p>
            </>
          )}
          <p><strong>Дата осмотра:</strong> {selectedExam.examinationDate ? new Date(selectedExam.examinationDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Результат:</strong> {selectedExam.result ? 'Годен' : 'Не годен'}</p>
          <p><strong>Заметки:</strong> {selectedExam.notes || 'Нет заметок'}</p>
        </DetailsModal>
      )}

      {showSummariesOnly && examinationSummaries ? (
        <NameList>
          {examinationSummaries.map((summary, index) => <li key={index}>{summary}</li>)}
        </NameList>
      ) : examinations ? (
        <CardContainer>
          {examinations.map(exam => 
            <MedicalExaminationCard 
              key={exam.id} 
              exam={exam} 
              onClick={() => setSelectedExam(exam)} 
            />
          )}
        </CardContainer>
      ) : null}

      {!(showSummariesOnly ? examinationSummaries : examinations) && !loading && <p>Нет данных для отображения.</p>}
    </PageContainer>
  );
}