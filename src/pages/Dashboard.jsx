import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiRefreshCw, FiTrendingUp, FiTarget, FiBookOpen } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import useProgress from '../hooks/useProgress';
import { useStudyContext } from '../context/StudyContext';
import { isOverdue, formatDate, getDaysUntil } from '../utils/helpers';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { stats, subjectProgress, weeklyProductivity } = useProgress();
  const { revisions, user, tasks } = useStudyContext();

  const upcomingRevisions = revisions
    .filter(r => !r.completed && new Date(r.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const overdueRevisions = revisions.filter(r => !r.completed && new Date(r.date) < new Date());

  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#2ecc71' },
    { name: 'Pending', value: stats.pending, color: '#f39c12' },
    { name: 'Overdue', value: stats.overdue, color: '#e74c3c' },
    { name: 'Revision', value: stats.revision, color: '#3498db' }
  ].filter(d => d.value > 0);

  const productivityData = weeklyProductivity.length > 0
    ? weeklyProductivity[weeklyProductivity.length - 1].days
    : [];

  const statCards = [
    { icon: <FiTarget />, label: 'Total Tasks', value: stats.total, bg: '#eef2ff', color: '#6366f1' },
    { icon: <FiCheckCircle />, label: 'Completed', value: stats.completed, bg: '#ecfdf5', color: '#2ecc71' },
    { icon: <FiClock />, label: 'Pending', value: stats.pending, bg: '#fffbeb', color: '#f59e0b' },
    { icon: <FiAlertTriangle />, label: 'Overdue', value: stats.overdue, bg: '#fef2f2', color: '#ef4444' }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <div className="page-header">
        <h1>Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h1>
        <p>Here's an overview of your study progress.</p>
      </div>

      <div className="stat-grid">
        {statCards.map((s, i) => (
          <motion.div className="stat-card" key={i} variants={fadeUp}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="chart-grid">
        <motion.div className="chart-card" variants={fadeUp}>
          <h3>Subject Progress</h3>
          {subjectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectProgress} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="progress" fill="#2ecc71" radius={[6, 6, 0, 0]} name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <FiBookOpen style={{ fontSize: 36, color: '#ccc' }} />
              <p style={{ marginTop: 12 }}>Add subjects to see progress</p>
            </div>
          )}
        </motion.div>

        <motion.div className="chart-card" variants={fadeUp}>
          <h3>Task Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <FiTarget style={{ fontSize: 36, color: '#ccc' }} />
              <p style={{ marginTop: 12 }}>Create tasks to see distribution</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="chart-grid">
        <motion.div className="chart-card" variants={fadeUp}>
          <h3>Weekly Productivity</h3>
          {productivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={productivityData} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Line type="monotone" dataKey="completed" stroke="#2ecc71" strokeWidth={2} dot={{ fill: '#2ecc71', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <FiTrendingUp style={{ fontSize: 36, color: '#ccc' }} />
              <p style={{ marginTop: 12 }}>Complete tasks to see productivity</p>
            </div>
          )}
        </motion.div>

        <motion.div className="chart-card" variants={fadeUp}>
          <h3>Upcoming Revisions</h3>
          {upcomingRevisions.length > 0 ? (
            <div className="revision-list" style={{ maxHeight: 240, overflowY: 'auto' }}>
              {upcomingRevisions.map(r => {
                const days = getDaysUntil(r.date);
                return (
                  <div className="revision-card" key={r.id} style={{ padding: '12px 16px' }}>
                    <div className="revision-date-badge" style={{ minWidth: 44, padding: 6 }}>
                      <div className="day" style={{ fontSize: 18 }}>{new Date(r.date).getDate()}</div>
                      <div className="month" style={{ fontSize: 10 }}>{new Date(r.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div className="revision-info">
                      <h4 style={{ fontSize: 13 }}>{r.topicName}</h4>
                      <p style={{ fontSize: 12 }}>{r.subjectName}</p>
                    </div>
                    <span className="status-badge" style={{
                      background: days <= 1 ? '#fef2f2' : '#ecfdf5',
                      color: days <= 1 ? '#ef4444' : '#2ecc71',
                      fontSize: 11
                    }}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <FiRefreshCw style={{ fontSize: 36, color: '#ccc' }} />
              <p style={{ marginTop: 12 }}>No upcoming revisions</p>
            </div>
          )}
        </motion.div>
      </div>

      {stats.completionRate > 0 && (
        <motion.div className="card" variants={fadeUp} style={{ marginTop: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Overall Completion</h3>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{stats.completionRate}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <motion.div className="progress-fill"
              style={{ background: 'linear-gradient(90deg, #2ecc71, #27ae60)', width: `${stats.completionRate}%` }}
              initial={{ width: 0 }} animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
