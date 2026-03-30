import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';

const NAV = {
  student: [
    { path: '/dashboard',    label: 'Главная',       icon: Home },
    { path: '/grades',       label: 'Оценки',        icon: Chart },
    { path: '/schedule',     label: 'Расписание',    icon: Calendar },
    { path: '/achievements', label: 'Достижения',    icon: Trophy },
    { path: '/ai-tutor',    label: 'AI Тьютор',     icon: Robot },
  ],
  teacher: [
    { path: '/dashboard', label: 'Главная',      icon: Home },
    { path: '/classes',   label: 'Мои классы',  icon: Users },
    { path: '/analytics', label: 'Аналитика',   icon: Chart },
    { path: '/schedule',  label: 'Расписание',  icon: Calendar },
  ],
  parent: [
    { path: '/dashboard',         label: 'Главная',     icon: Home },
    { path: '/parent/grades',     label: 'Оценки',      icon: Chart },
    { path: '/parent/attendance', label: 'Посещаемость',icon: Calendar },
  ],
  admin: [
    { path: '/dashboard',     label: 'Главная',    icon: Home },
    { path: '/admin/users',   label: 'Пользователи', icon: Users },
    { path: '/admin/reports', label: 'Отчёты',     icon: Chart },
  ],
};

const ROLE_LABELS = {
  student: 'Ученик',
  teacher: 'Учитель',
  parent:  'Родитель',
  admin:   'Администратор',
};

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-violet-100 text-violet-700',
  parent:  'bg-emerald-100 text-emerald-700',
  admin:   'bg-orange-100 text-orange-700',
};

// SVG icons
function Home() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function Chart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function Calendar() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function Trophy() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
function Robot() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function Users() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function LogOut() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function Menu() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const { user, role } = useAuth();
  const { logout } = useAuthStore();
  const location = useLocation();

  const items = NAV[role] || NAV.student;
  const isActive = (path) => location.pathname === path;
  const pageTitle = items.find(i => isActive(i.path))?.label ?? 'Главная';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${open ? 'w-56' : 'w-16'} flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            A
          </div>
          {open && (
            <div className="ml-2.5 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 leading-tight">Aqbobek</p>
              <p className="text-xs text-gray-400 leading-tight">Lyceum Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {items.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              title={!open ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="flex-shrink-0"><Icon /></span>
              {open && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-gray-100">
          {open ? (
            <div className="flex items-center gap-2.5 mb-2.5">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt=""
                className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{user?.full_name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt=""
                className="w-8 h-8 rounded-full bg-gray-100"
              />
            </div>
          )}
          <button
            onClick={logout}
            title="Выйти"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut />
            {open && 'Выйти'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Menu />
          </button>
          <h1 className="text-base font-semibold text-gray-800 flex-1">{pageTitle}</h1>
          <span className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
