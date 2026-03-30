import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, role } = useAuth();
  const { logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = {
    student: [
      { path: '/dashboard', label: '📊 Дашборд', icon: '📊' },
      { path: '/grades', label: '📝 Оценки', icon: '📝' },
      { path: '/schedule', label: '📅 Расписание', icon: '📅' },
      { path: '/achievements', label: '🏆 Достижения', icon: '🏆' },
      { path: '/ai-tutor', label: '🤖 AI Тьютор', icon: '🤖' },
    ],
    teacher: [
      { path: '/dashboard', label: '📊 Дашборд', icon: '📊' },
      { path: '/classes', label: '👥 Мои классы', icon: '👥' },
      { path: '/analytics', label: '📈 Аналитика', icon: '📈' },
      { path: '/schedule', label: '📅 Расписание', icon: '📅' },
    ],
    admin: [
      { path: '/dashboard', label: '📊 Дашборд', icon: '📊' },
      { path: '/users', label: '👥 Пользователи', icon: '👥' },
      { path: '/schedule-manager', label: '📅 Расписание', icon: '📅' },
      { path: '/reports', label: '📈 Отчеты', icon: '📈' },
    ],
  };

  const currentMenuItems = menuItems[role] || menuItems.student;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Lyceum</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {currentMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Профиль</p>
              <p className="text-sm font-semibold mt-1 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            {sidebarOpen ? 'Выход' : '🚪'}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentMenuItems.find((item) => isActive(item.path))?.label || 'Дашборд'}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;