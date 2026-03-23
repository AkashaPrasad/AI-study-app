import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import useSubjects from '../hooks/useSubjects';
import { subjectColors, statusColors } from '../utils/helpers';
import { generateId } from '../utils/helpers';

const subjectSchema = yup.object({
  name: yup.string().required('Subject name is required'),
  description: yup.string()
});

const topicSchema = yup.object({
  name: yup.string().required('Topic name is required'),
  difficulty: yup.string().required('Select difficulty'),
  notes: yup.string()
});

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Subjects = () => {
  const { subjects, createSubject, updateSubject, deleteSubject, topics, createTopic, updateTopic, deleteTopic, getTopicsForSubject } = useSubjects();
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(subjectColors[0]);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const { register: regSubject, handleSubmit: handleSubjectSubmit, reset: resetSubject, formState: { errors: subjectErrors }, setValue: setSubjectValue } = useForm({ resolver: yupResolver(subjectSchema) });
  const { register: regTopic, handleSubmit: handleTopicSubmit, reset: resetTopic, formState: { errors: topicErrors }, setValue: setTopicValue } = useForm({ resolver: yupResolver(topicSchema) });

  const toggleExpand = (id) => setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));

  const openSubjectModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectValue('name', subject.name);
      setSubjectValue('description', subject.description);
      setSelectedColor(subject.color);
    } else {
      setEditingSubject(null);
      resetSubject();
      setSelectedColor(subjectColors[0]);
    }
    setShowSubjectModal(true);
  };

  const openTopicModal = (subjectId, topic = null) => {
    setActiveSubjectId(subjectId);
    if (topic) {
      setEditingTopic(topic);
      setTopicValue('name', topic.name);
      setTopicValue('difficulty', topic.difficulty);
      setTopicValue('notes', topic.notes || '');
    } else {
      setEditingTopic(null);
      resetTopic();
    }
    setShowTopicModal(true);
  };

  const onSubjectSubmit = (data) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, { ...data, color: selectedColor });
      toast.success('Subject updated!');
    } else {
      createSubject({ ...data, color: selectedColor });
      toast.success('Subject created!');
    }
    setShowSubjectModal(false);
    resetSubject();
  };

  const onTopicSubmit = (data) => {
    if (editingTopic) {
      updateTopic(editingTopic.id, data);
      toast.success('Topic updated!');
    } else {
      createTopic({ ...data, subjectId: activeSubjectId, status: 'Not Started' });
      toast.success('Topic added!');
    }
    setShowTopicModal(false);
    resetTopic();
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Delete this subject and all its topics?')) {
      deleteSubject(id);
      toast.success('Subject deleted');
    }
  };

  const handleDeleteTopic = (id) => {
    deleteTopic(id);
    toast.success('Topic deleted');
  };

  const cycleTopicStatus = (topic) => {
    const statuses = ['Not Started', 'In Progress', 'Completed', 'Needs Revision'];
    const currentIdx = statuses.indexOf(topic.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
    updateTopic(topic.id, { status: nextStatus });
    toast.info(`Status: ${nextStatus}`);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Subjects</h1>
          <p>Manage your subjects and topics</p>
        </div>
        <button className="btn btn-primary" onClick={() => openSubjectModal()}>
          <FiPlus /> Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <motion.div className="empty-state" variants={fadeUp}>
          <FiBookOpen />
          <h3>No Subjects Yet</h3>
          <p>Create your first subject to start organizing your study materials.</p>
          <button className="btn btn-primary" onClick={() => openSubjectModal()}>
            <FiPlus /> Create Subject
          </button>
        </motion.div>
      ) : (
        <div className="subject-grid">
          {subjects.map(subject => {
            const subjectTopics = getTopicsForSubject(subject.id);
            const completed = subjectTopics.filter(t => t.status === 'Completed').length;
            const progress = subjectTopics.length > 0 ? Math.round((completed / subjectTopics.length) * 100) : 0;
            const isExpanded = expandedSubjects[subject.id];

            return (
              <motion.div className="subject-card" key={subject.id} variants={fadeUp}>
                <div className="subject-card-header">
                  <div>
                    <h3>
                      <span className="subject-card-color" style={{ background: subject.color }} />
                      {subject.name}
                    </h3>
                    {subject.description && <p>{subject.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => openSubjectModal(subject)}><FiEdit2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteSubject(subject.id)}><FiTrash2 size={14} /></button>
                  </div>
                </div>

                <div className="subject-card-stats">
                  <span className="subject-card-stat"><strong>{subjectTopics.length}</strong> topics</span>
                  <span className="subject-card-stat"><strong>{completed}</strong> completed</span>
                  <span className="subject-card-stat"><strong>{progress}%</strong> done</span>
                </div>

                <div className="subject-card-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: subject.color }} />
                  </div>
                </div>

                <div className="subject-card-topics">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleExpand(subject.id)}>
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      Topics ({subjectTopics.length})
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openTopicModal(subject.id)}>
                      <FiPlus size={14} /> Add
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && subjectTopics.map(topic => (
                      <motion.div className="topic-item" key={topic.id}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="topic-info">
                          <h4>{topic.name}</h4>
                          <span className="difficulty-badge">{topic.difficulty}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button className="status-badge" onClick={() => cycleTopicStatus(topic)}
                            style={{ background: `${statusColors[topic.status]}15`, color: statusColors[topic.status], cursor: 'pointer', border: 'none' }}>
                            {topic.status}
                          </button>
                          <div className="topic-actions">
                            <button className="btn btn-ghost btn-icon" onClick={() => openTopicModal(subject.id, topic)}><FiEdit2 size={12} /></button>
                            <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteTopic(topic.id)}><FiTrash2 size={12} /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showSubjectModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSubjectModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{editingSubject ? 'Edit Subject' : 'New Subject'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowSubjectModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubjectSubmit(onSubjectSubmit)}>
                <div className="form-group">
                  <label>Subject Name</label>
                  <input {...regSubject('name')} placeholder="e.g. Mathematics" />
                  {subjectErrors.name && <p className="form-error">{subjectErrors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea {...regSubject('description')} placeholder="Brief description..." rows={3} />
                </div>
                <div className="form-group">
                  <label>Color Label</label>
                  <div className="color-picker">
                    {subjectColors.map(c => (
                      <div key={c} className={`color-swatch ${selectedColor === c ? 'selected' : ''}`}
                        style={{ background: c }} onClick={() => setSelectedColor(c)} />
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingSubject ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTopicModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTopicModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{editingTopic ? 'Edit Topic' : 'New Topic'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowTopicModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleTopicSubmit(onTopicSubmit)}>
                <div className="form-group">
                  <label>Topic Name</label>
                  <input {...regTopic('name')} placeholder="e.g. Binary Trees" />
                  {topicErrors.name && <p className="form-error">{topicErrors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select {...regTopic('difficulty')}>
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {topicErrors.difficulty && <p className="form-error">{topicErrors.difficulty.message}</p>}
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea {...regTopic('notes')} placeholder="Additional notes..." rows={3} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTopicModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingTopic ? 'Update' : 'Add Topic'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Subjects;
