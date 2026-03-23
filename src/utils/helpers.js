export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const isOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getCompletionPercentage = (items) => {
  if (!items || items.length === 0) return 0;
  const completed = items.filter(i => i.status === 'Completed').length;
  return Math.round((completed / items.length) * 100);
};

export const subjectColors = [
  '#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f39c12',
  '#1abc9c', '#e67e22', '#2980b9', '#8e44ad', '#d35400'
];

export const priorityColors = {
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#2ecc71'
};

export const statusColors = {
  'Not Started': '#95a5a6',
  'In Progress': '#3498db',
  'Completed': '#2ecc71',
  'Needs Revision': '#f39c12',
  'Pending': '#f39c12',
  'Overdue': '#e74c3c'
};

export const STORAGE_KEYS = {
  SUBJECTS: 'studyCompanion_subjects',
  TOPICS: 'studyCompanion_topics',
  TASKS: 'studyCompanion_tasks',
  REVISIONS: 'studyCompanion_revisions',
  USER: 'studyCompanion_user'
};

export const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};
