import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import SubjectsManagement from './pages/admin/SubjectsManagement';
import ClassesManagement from './pages/admin/ClassesManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import GradesManagement from './pages/admin/GradesManagement';
import AchievementsManagement from './pages/admin/AchievementsManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import ParentDashboard from './pages/parent/ParentDashboard';
import GradesPage from './pages/student/GradesPage';
import SchedulePage from './pages/student/SchedulePage';
import AchievementsPage from './pages/student/AchievementsPage';
import ClassesPage from './pages/teacher/ClassesPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';
import NotificationContainer from './components/NotificationContainer';
import './styles/globals.css';

function getDashboardPath(user) {
  if (!user) return '/login';
  const role = user.user_type || user.role;
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  if (role === 'parent') return '/parent';
  if (role === 'student') return '/student';
  return '/login';
}

function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [shouldLogout, setShouldLogout] = useState(false);

  const role = user?.user_type || user?.role;
  const invalidRole = user && (!role || !['admin', 'teacher', 'student', 'parent'].includes(role));

  useEffect(() => {
    if (invalidRole) {
      logout();
      setShouldLogout(true);
    }
  }, [invalidRole, logout]);

  if (!isAuthenticated || !user || shouldLogout) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginRoute() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }
  return <LoginPage />;
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <NotificationContainer />
      <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/grades" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><GradesPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/schedule" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><SchedulePage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/achievements" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><AchievementsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/students" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><ClassesPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/analytics" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><AnalyticsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Parent routes */}
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/*" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><UsersManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/subjects" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><SubjectsManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><ClassesManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/schedule" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><ScheduleManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/grades" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><GradesManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/achievements" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AchievementsManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AttendanceManagement /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
  );
}

export default App;
