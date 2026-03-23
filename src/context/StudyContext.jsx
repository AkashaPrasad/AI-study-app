import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/helpers';

const StudyContext = createContext();

export const useStudyContext = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudyContext must be used within StudyProvider');
  return context;
};

export const StudyProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => loadFromStorage(STORAGE_KEYS.SUBJECTS) || []);
  const [topics, setTopics] = useState(() => loadFromStorage(STORAGE_KEYS.TOPICS) || []);
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.TASKS) || []);
  const [revisions, setRevisions] = useState(() => loadFromStorage(STORAGE_KEYS.REVISIONS) || []);
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER) || null);

  useEffect(() => { saveToStorage(STORAGE_KEYS.SUBJECTS, subjects); }, [subjects]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.TOPICS, topics); }, [topics]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.TASKS, tasks); }, [tasks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REVISIONS, revisions); }, [revisions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.USER, user); }, [user]);

  const addSubject = (subject) => setSubjects(prev => [...prev, subject]);
  const updateSubject = (id, data) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    setTasks(prev => prev.filter(t => t.subject !== id));
  };

  const addTopic = (topic) => setTopics(prev => [...prev, topic]);
  const updateTopic = (id, data) => setTopics(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTopic = (id) => setTopics(prev => prev.filter(t => t.id !== id));

  const addTask = (task) => setTasks(prev => [...prev, task]);
  const updateTask = (id, data) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const addRevision = (revision) => setRevisions(prev => [...prev, revision]);
  const updateRevision = (id, data) => setRevisions(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  const deleteRevision = (id) => setRevisions(prev => prev.filter(r => r.id !== id));

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const value = {
    subjects, addSubject, updateSubject, deleteSubject,
    topics, addTopic, updateTopic, deleteTopic,
    tasks, addTask, updateTask, deleteTask,
    revisions, addRevision, updateRevision, deleteRevision,
    user, login, logout
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};
