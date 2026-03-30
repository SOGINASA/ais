import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import NotificationContainer from './components/NotificationContainer';
import './styles/globals.css';

// Pages
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import GradesPage from './pages/student/GradesPage';
import SchedulePage from './pages/student/SchedulePage';
import AchievementsPage from './pages/student/AchievementsPage';

import ClassesPage from './pages/teacher/ClassesPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';

import ChildGradesPage from './pages/parent/ChildGradesPage';
import AttendancePage from './pages/parent/AttendancePage';

import UsersPage from './pages/admin/UsersPage';
import ReportsPage from './pages/admin/ReportsPage';

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl mb-2">🚧</p>
      <p className="text-gray-500">{title} — скоро</p>
    </div>
  </div>
);

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const dashboard =
    role === 'student' ? <StudentDashboard /> :
    role === 'teacher' ? <TeacherDashboard /> :
    role === 'parent'  ? <ParentDashboard /> :
    role === 'admin'   ? <AdminDashboard /> :
    <StudentDashboard />;

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard"          element={dashboard} />
        <Route path="/grades"             element={<GradesPage />} />
        <Route path="/schedule"           element={<SchedulePage />} />
        <Route path="/achievements"       element={<AchievementsPage />} />
        <Route path="/ai-tutor"           element={<Placeholder title="AI Тьютор" />} />
        <Route path="/classes"            element={<ClassesPage />} />
        <Route path="/analytics"          element={<AnalyticsPage />} />
        <Route path="/parent/grades"      element={<ChildGradesPage />} />
        <Route path="/parent/attendance"  element={<AttendancePage />} />
        <Route path="/admin/users"        element={<UsersPage />} />
        <Route path="/admin/reports"      element={<ReportsPage />} />
        <Route path="/"                   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"                   element={<Navigate to="/dashboard" replace />} />
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
