import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBookOpen, FiCheckSquare, FiCalendar, FiCpu, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useStudyContext } from '../context/StudyContext';

const navItems = [
  { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { path: '/subjects', icon: <FiBookOpen />, label: 'Subjects' },
  { path: '/tasks', icon: <FiCheckSquare />, label: 'Tasks' },
  { path: '/revision', icon: <FiCalendar />, label: 'Revision' },
  { path: '/ai-tools', icon: <FiCpu />, label: 'AI Tools' }
];

const AppLayout = ({ children }) => {
  const { user, logout } = useStudyContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <div className={`mobile-header`} style={{ display: 'none' }}>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
        <span style={{ fontWeight: 600 }}>StudyAI</span>
        <div style={{ width: 24 }} />
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><FiBookOpen /></div>
          <div>
            <h2>StudyAI</h2>
            <span>Study Companion</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-user">
            {user.picture ? (
              <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
            ) : (
              <div className="sidebar-logo-icon" style={{ width: 36, height: 36, fontSize: 14 }}>
                {user.name?.charAt(0)}
              </div>
            )}
            <div className="sidebar-user-info">
              <p>{user.name}</p>
              <span>{user.email}</span>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
