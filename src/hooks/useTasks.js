import { useStudyContext } from '../context/StudyContext';
import { generateId, isOverdue } from '../utils/helpers';

const useTasks = () => {
  const { tasks, addTask, updateTask, deleteTask, subjects } = useStudyContext();

  const createTask = (taskData) => {
    const task = {
      id: generateId(),
      ...taskData,
      status: taskData.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    addTask(task);
    return task;
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, {
        status: task.status === 'Completed' ? 'Pending' : 'Completed',
        completedAt: task.status === 'Completed' ? null : new Date().toISOString()
      });
    }
  };

  const getFilteredTasks = (filters = {}) => {
    let filtered = [...tasks];
    if (filters.tab === 'Pending') filtered = filtered.filter(t => t.status === 'Pending');
    else if (filters.tab === 'Completed') filtered = filtered.filter(t => t.status === 'Completed');
    else if (filters.tab === 'Overdue') filtered = filtered.filter(t => t.status !== 'Completed' && isOverdue(t.deadline));
    else if (filters.tab === 'Revision') filtered = filtered.filter(t => t.status === 'Revision');

    if (filters.subject) filtered = filtered.filter(t => t.subject === filters.subject);
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
    if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.topic && t.topic.toLowerCase().includes(q))
      );
    }

    if (filters.sort === 'deadline') filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    else if (filters.sort === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      filtered.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (filters.sort === 'subject') {
      filtered.sort((a, b) => {
        const sa = subjects.find(s => s.id === a.subject)?.name || '';
        const sb = subjects.find(s => s.id === b.subject)?.name || '';
        return sa.localeCompare(sb);
      });
    }

    return filtered;
  };

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => t.status !== 'Completed' && isOverdue(t.deadline)).length;
  const revisionCount = tasks.filter(t => t.status === 'Revision').length;

  return {
    tasks, createTask, updateTask, deleteTask, toggleComplete,
    getFilteredTasks, pendingCount, completedCount, overdueCount, revisionCount
  };
};

export default useTasks;
