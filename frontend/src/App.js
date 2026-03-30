import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import NotificationContainer from './components/NotificationContainer';
import './styles/globals.css';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/dashboard"
          element={
            role === 'student' ? (
              <StudentDashboard />
            ) : role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <StudentDashboard />
            )
          }
        />
        <Route path="/grades" element={<div className="text-center py-12"><p>Страница оценок - в разработке</p></div>} />
        <Route path="/schedule" element={<div className="text-center py-12"><p>Расписание - в разработке</p></div>} />
        <Route path="/achievements" element={<div className="text-center py-12"><p>Достижения - в разработке</p></div>} />
        <Route path="/ai-tutor" element={<div className="text-center py-12"><p>AI Тьютор - в разработке</p></div>} />
        <Route path="/classes" element={<div className="text-center py-12"><p>Мои классы - в разработке</p></div>} />
        <Route path="/analytics" element={<div className="text-center py-12"><p>Аналитика - в разработке</p></div>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <>
      <NotificationContainer />
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;
