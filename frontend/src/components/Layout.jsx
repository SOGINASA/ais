import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  Award,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Bot,
} from 'lucide-react';

const Layout = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.user_type || user?.role;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path) => {
    if (path === '/admin' || path === '/student' || path === '/teacher' || path === '/parent') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const adminMenuItems = [
    { path: '/admin', label: 'Главная', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Пользователи', icon: Users },
    { path: '/admin/subjects', label: 'Предметы', icon: BookOpen },
    { path: '/admin/classes', label: 'Классы', icon: Building2 },
    { path: '/admin/schedule', label: 'Расписание', icon: Calendar },
    { path: '/admin/grades', label: 'Оценки', icon: FileText },
    { path: '/admin/achievements', label: 'Достижения', icon: Award },
    { path: '/admin/attendance', label: 'Посещаемость', icon: CheckSquare },
  ];

  const studentMenuItems = [
    { path: '/student', label: 'Главная', icon: LayoutDashboard },
    { path: '/student/grades', label: 'Оценки', icon: FileText },
    { path: '/student/schedule', label: 'Расписание', icon: Calendar },
    { path: '/student/achievements', label: 'Достижения', icon: Award },
    { path: '/student/analytics', label: 'Аналитика', icon: LayoutDashboard },
    { path: '/student/ai-tutor', label: 'AI Тьютор', icon: Bot },
  ];

  const teacherMenuItems = [
    { path: '/teacher', label: 'Главная', icon: LayoutDashboard },
    { path: '/teacher/grades', label: 'Оценки', icon: FileText },
    { path: '/teacher/schedule', label: 'Расписание', icon: Calendar },
    { path: '/teacher/students', label: 'Студенты', icon: Users },
    { path: '/teacher/analytics', label: 'Аналитика', icon: LayoutDashboard },
  ];

  const parentMenuItems = [
    { path: '/parent', label: 'Главная', icon: LayoutDashboard },
  ];

  const menuMap = {
    admin: adminMenuItems,
    student: studentMenuItems,
    teacher: teacherMenuItems,
    parent: parentMenuItems,
  };

  const menuItems = menuMap[role] || studentMenuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className={`font-bold text-lg text-blue-600 ${!sidebarOpen && 'text-center w-full'}`}>
            {sidebarOpen ? 'Aqbobek' : 'A'}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {!sidebarOpen && (
          <div className="h-12 flex items-center justify-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={!sidebarOpen ? 'Выход' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Выход</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-900">Aqbobek Lyceum Portal</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
