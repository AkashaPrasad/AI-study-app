import { useStudyContext } from '../context/StudyContext';
import { generateId } from '../utils/helpers';

const useSubjects = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, topics, addTopic, updateTopic, deleteTopic } = useStudyContext();

  const createSubject = (data) => {
    const subject = { id: generateId(), ...data };
    addSubject(subject);
    return subject;
  };

  const createTopic = (data) => {
    const topic = {
      id: generateId(),
      status: 'Not Started',
      ...data
    };
    addTopic(topic);
    return topic;
  };

  const getTopicsForSubject = (subjectId) => topics.filter(t => t.subjectId === subjectId);

  const getSubjectById = (id) => subjects.find(s => s.id === id);

  return {
    subjects, createSubject, updateSubject, deleteSubject,
    topics, createTopic, updateTopic, deleteTopic,
    getTopicsForSubject, getSubjectById
  };
};

export default useSubjects;
