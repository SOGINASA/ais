import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './store/useAuthStore';
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

/** Редирект на /dashboard если роль не совпадает */
function RoleGuard({ allow, children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/** Основные маршруты — только для аутентифицированных */
function AuthenticatedApp() {
  useWebSocket();
  const { role } = useAuth();

  const dashboard =
    role === 'student' ? <StudentDashboard /> :
    role === 'teacher' ? <TeacherDashboard /> :
    role === 'parent'  ? <ParentDashboard />  :
    role === 'admin'   ? <AdminDashboard />   :
    <StudentDashboard />;

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={dashboard} />

        {/* Student routes */}
        <Route path="/grades"       element={<RoleGuard allow={['student']}><GradesPage /></RoleGuard>} />
        <Route path="/schedule"     element={<RoleGuard allow={['student']}><SchedulePage /></RoleGuard>} />
        <Route path="/achievements" element={<RoleGuard allow={['student']}><AchievementsPage /></RoleGuard>} />
        <Route path="/ai-tutor"     element={<RoleGuard allow={['student']}><Placeholder title="AI Тьютор" /></RoleGuard>} />

        {/* Teacher routes */}
        <Route path="/classes"   element={<RoleGuard allow={['teacher']}><ClassesPage /></RoleGuard>} />
        <Route path="/analytics" element={<RoleGuard allow={['teacher']}><AnalyticsPage /></RoleGuard>} />

        {/* Parent routes */}
        <Route path="/parent/grades"      element={<RoleGuard allow={['parent']}><ChildGradesPage /></RoleGuard>} />
        <Route path="/parent/attendance"  element={<RoleGuard allow={['parent']}><AttendancePage /></RoleGuard>} />

        {/* Admin routes */}
        <Route path="/admin/users"   element={<RoleGuard allow={['admin']}><UsersPage /></RoleGuard>} />
        <Route path="/admin/reports" element={<RoleGuard allow={['admin']}><ReportsPage /></RoleGuard>} />

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const [ready, setReady]   = useState(false);
  const restoreSession      = useAuthStore((s) => s.restoreSession);

  // Restore session ONCE on app startup
  useEffect(() => {
    restoreSession();
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />;
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
