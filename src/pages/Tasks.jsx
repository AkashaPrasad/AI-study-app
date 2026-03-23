import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiClock, FiAlertTriangle, FiRefreshCw, FiList, FiX, FiCalendar } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import useTasks from '../hooks/useTasks';
import useSubjects from '../hooks/useSubjects';
import useDebounce from '../hooks/useDebounce';
import { formatDate, isOverdue, priorityColors } from '../utils/helpers';

const taskSchema = yup.object({
  title: yup.string().required('Task title is required'),
  subject: yup.string().required('Select a subject'),
  topic: yup.string(),
  deadline: yup.string().required('Set a deadline'),
  priority: yup.string().required('Select priority')
});

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Tasks = () => {
  const { tasks, createTask, updateTask, deleteTask, toggleComplete, getFilteredTasks, pendingCount, completedCount, overdueCount, revisionCount } = useTasks();
  const { subjects, topics, getTopicsForSubject } = useSubjects();

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ resolver: yupResolver(taskSchema) });
  const watchedSubject = watch('subject');

  const filteredTasks = useMemo(() => getFilteredTasks({
    tab: activeTab, search: debouncedSearch, subject: filterSubject,
    priority: filterPriority, sort: sortBy
  }), [activeTab, debouncedSearch, filterSubject, filterPriority, sortBy, tasks]);

  const subjectTopics = watchedSubject ? getTopicsForSubject(watchedSubject) : [];

  const tabs = [
    { name: 'All', count: tasks.length, icon: <FiList size={14} /> },
    { name: 'Pending', count: pendingCount, icon: <FiClock size={14} /> },
    { name: 'Completed', count: completedCount, icon: <FiCheck size={14} /> },
    { name: 'Overdue', count: overdueCount, icon: <FiAlertTriangle size={14} /> },
    { name: 'Revision', count: revisionCount, icon: <FiRefreshCw size={14} /> }
  ];

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setValue('title', task.title);
      setValue('subject', task.subject);
      setValue('topic', task.topic || '');
      setValue('deadline', task.deadline);
      setValue('priority', task.priority);
    } else {
      setEditingTask(null);
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      toast.success('Task updated!');
    } else {
      createTask({ ...data, status: 'Pending' });
      toast.success('Task created!');
    }
    setShowModal(false);
    reset();
  };

  const handleDelete = (id) => {
    deleteTask(id);
    toast.success('Task deleted');
  };

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '';
  const getSubjectColor = (id) => subjects.find(s => s.id === id)?.color || '#999';

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Study Tasks</h1>
          <p>Manage and track your study tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> New Task
        </button>
      </div>

      <motion.div className="tabs" variants={fadeUp}>
        {tabs.map(tab => (
          <button key={tab.name} className={`tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}>
            {tab.icon} {tab.name} <span className="badge">{tab.count}</span>
          </button>
        ))}
      </motion.div>

      <motion.div className="toolbar" variants={fadeUp}>
        <div className="search-wrapper">
          <FiSearch />
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="deadline">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="subject">Sort: Subject</option>
        </select>
      </motion.div>

      {filteredTasks.length === 0 ? (
        <motion.div className="empty-state" variants={fadeUp}>
          <FiList />
          <h3>No Tasks Found</h3>
          <p>{tasks.length === 0 ? 'Create your first study task to get started.' : 'Try adjusting your filters.'}</p>
          {tasks.length === 0 && (
            <button className="btn btn-primary" onClick={() => openModal()}>
              <FiPlus /> Create Task
            </button>
          )}
        </motion.div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => {
            const overdue = task.status !== 'Completed' && isOverdue(task.deadline);
            return (
              <motion.div className="task-card" key={task.id} variants={fadeUp} layout>
                <div className={`task-checkbox ${task.status === 'Completed' ? 'checked' : ''}`}
                  onClick={() => toggleComplete(task.id)}>
                  {task.status === 'Completed' && <FiCheck size={14} />}
                </div>
                <div className={`task-card-content ${task.status === 'Completed' ? 'completed' : ''}`}>
                  <h4>{task.title}</h4>
                  <div className="task-meta">
                    {task.subject && (
                      <span>
                        <span className="priority-dot" style={{ background: getSubjectColor(task.subject) }} />
                        {getSubjectName(task.subject)}
                      </span>
                    )}
                    <span className={overdue ? 'overdue' : ''}>
                      <FiCalendar size={12} /> {formatDate(task.deadline)}
                      {overdue && ' (Overdue)'}
                    </span>
                    <span>
                      <span className="priority-dot" style={{ background: priorityColors[task.priority] }} />
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="task-card-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => openModal(task)}><FiEdit2 size={14} /></button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(task.id)}><FiTrash2 size={14} /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input {...register('title')} placeholder="e.g. Solve 10 binary tree problems" />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select {...register('subject')}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                </div>
                {subjectTopics.length > 0 && (
                  <div className="form-group">
                    <label>Topic (optional)</label>
                    <select {...register('topic')}>
                      <option value="">Select topic</option>
                      {subjectTopics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" {...register('deadline')} />
                  {errors.deadline && <p className="form-error">{errors.deadline.message}</p>}
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select {...register('priority')}>
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.priority && <p className="form-error">{errors.priority.message}</p>}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create Task'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;
