import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiTrash2, FiCalendar, FiAlertTriangle, FiRefreshCw, FiX } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useStudyContext } from '../context/StudyContext';
import useSubjects from '../hooks/useSubjects';
import { generateId, formatDate, getDaysUntil } from '../utils/helpers';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Revision = () => {
  const { revisions, addRevision, updateRevision, deleteRevision, topics } = useStudyContext();
  const { subjects, getTopicsForSubject } = useSubjects();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [daysAfter, setDaysAfter] = useState(3);

  const upcomingRevisions = useMemo(() =>
    revisions.filter(r => !r.completed).sort((a, b) => new Date(a.date) - new Date(b.date)), [revisions]);

  const completedRevisions = useMemo(() =>
    revisions.filter(r => r.completed).sort((a, b) => new Date(b.date) - new Date(a.date)), [revisions]);

  const overdueRevisions = useMemo(() =>
    revisions.filter(r => !r.completed && new Date(r.date) < new Date()), [revisions]);

  const revisionDates = useMemo(() =>
    revisions.filter(r => !r.completed).map(r => format(new Date(r.date), 'yyyy-MM-dd')), [revisions]);

  const selectedDateRevisions = useMemo(() =>
    revisions.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')), [revisions, selectedDate]);

  const subjectTopics = selectedSubject ? getTopicsForSubject(selectedSubject) : [];

  const handleCreate = () => {
    if (!selectedSubject || !selectedTopic) {
      toast.error('Select subject and topic');
      return;
    }
    const topic = topics.find(t => t.id === selectedTopic);
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!topic || !subject) return;

    addRevision({
      id: generateId(),
      topicId: selectedTopic,
      topicName: topic.name,
      subjectId: selectedSubject,
      subjectName: subject.name,
      date: format(addDays(new Date(), daysAfter), 'yyyy-MM-dd'),
      completed: false,
      createdAt: new Date().toISOString()
    });
    toast.success('Revision scheduled!');
    setShowModal(false);
    setSelectedSubject('');
    setSelectedTopic('');
  };

  const markComplete = (id) => {
    updateRevision(id, { completed: true, completedAt: new Date().toISOString() });
    toast.success('Revision completed!');
  };

  const handleDelete = (id) => {
    deleteRevision(id);
    toast.success('Revision removed');
  };

  const tileClassName = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (revisionDates.includes(dateStr)) return 'revision-highlight';
    return null;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Revision Planner</h1>
          <p>Schedule and track your revision sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Schedule Revision
        </button>
      </div>

      {overdueRevisions.length > 0 && (
        <motion.div className="card" variants={fadeUp} style={{ marginBottom: 20, background: '#fef2f2', borderColor: '#fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiAlertTriangle color="#ef4444" size={20} />
            <div>
              <h4 style={{ fontSize: 14, color: '#ef4444' }}>{overdueRevisions.length} Overdue Revision{overdueRevisions.length > 1 ? 's' : ''}</h4>
              <p style={{ fontSize: 13, color: '#b91c1c' }}>You have revisions that need attention.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="revision-layout">
        <div>
          <motion.div variants={fadeUp}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Upcoming Revisions</h3>
            {upcomingRevisions.length === 0 ? (
              <div className="empty-state">
                <FiRefreshCw />
                <h3>No Revisions Scheduled</h3>
                <p>Schedule revision sessions for topics you've completed.</p>
              </div>
            ) : (
              <div className="revision-list">
                {upcomingRevisions.map(r => {
                  const days = getDaysUntil(r.date);
                  const isOverdueItem = days !== null && days < 0;
                  return (
                    <motion.div className="revision-card" key={r.id} variants={fadeUp}>
                      <div className="revision-date-badge">
                        <div className="day">{new Date(r.date).getDate()}</div>
                        <div className="month">{new Date(r.date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div className="revision-info">
                        <h4>{r.topicName}</h4>
                        <p>{r.subjectName}</p>
                      </div>
                      <span className="revision-status" style={{
                        background: isOverdueItem ? '#fef2f2' : days <= 1 ? '#fffbeb' : '#ecfdf5',
                        color: isOverdueItem ? '#ef4444' : days <= 1 ? '#f59e0b' : '#2ecc71'
                      }}>
                        {isOverdueItem ? 'Overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => markComplete(r.id)} title="Mark complete">
                          <FiCheck size={16} color="#2ecc71" />
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(r.id)} title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {completedRevisions.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Completed</h3>
                <div className="revision-list">
                  {completedRevisions.slice(0, 5).map(r => (
                    <div className="revision-card" key={r.id} style={{ opacity: 0.6 }}>
                      <div className="revision-date-badge">
                        <div className="day">{new Date(r.date).getDate()}</div>
                        <div className="month">{new Date(r.date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div className="revision-info">
                        <h4 style={{ textDecoration: 'line-through' }}>{r.topicName}</h4>
                        <p>{r.subjectName}</p>
                      </div>
                      <span className="revision-status" style={{ background: '#ecfdf5', color: '#2ecc71' }}>Done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <div className="card calendar-container">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Calendar</h3>
            <Calendar onChange={setSelectedDate} value={selectedDate} tileClassName={tileClassName} />
            {selectedDateRevisions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  {format(selectedDate, 'MMM d, yyyy')}
                </p>
                {selectedDateRevisions.map(r => (
                  <div key={r.id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <strong>{r.topicName}</strong> — {r.subjectName}
                    {r.completed && <span style={{ color: 'var(--primary)', marginLeft: 8 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Schedule Revision</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {subjectTopics.length > 0 && (
                <div className="form-group">
                  <label>Topic</label>
                  <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
                    <option value="">Select topic</option>
                    {subjectTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Revise after (days)</label>
                <input type="number" min="1" max="30" value={daysAfter} onChange={e => setDaysAfter(parseInt(e.target.value) || 1)} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Scheduled for: {format(addDays(new Date(), daysAfter), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Schedule</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Revision;
