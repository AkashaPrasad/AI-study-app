import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StudyProvider, useStudyContext } from './context/StudyContext';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import Revision from './pages/Revision';
import AITools from './pages/AITools';

const GOOGLE_CLIENT_ID = '908727741603-er3os9r3nnu988vc9f9h77d5h2hvcid5.apps.googleusercontent.com';

const ProtectedRoute = ({ children }) => {
  const { user } = useStudyContext();
  if (!user) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
      <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <StudyProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop
            closeOnClick pauseOnFocusLoss={false} draggable={false} toastClassName="toast-custom" />
        </BrowserRouter>
      </StudyProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
