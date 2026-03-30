import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotification } from '../hooks/useNotification';

const ACCOUNTS = [
  { email: 'ayman@school.kz',              name: 'Айман Смагулов',   role: 'Ученик',          color: 'border-blue-200 bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
  { email: 'daria@school.kz',              name: 'Дарья Иванова',    role: 'Учитель',         color: 'border-violet-200 bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  { email: 'zhanna.smagulova@example.kz',  name: 'Жанна Смагулова',  role: 'Родитель',        color: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  { email: 'admin@school.kz',              name: 'Администратор',    role: 'Администрация',   color: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('ayman@school.kz');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { success, error } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Добро пожаловать!');
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left: form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">A</div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Aqbobek Lyceum</p>
                <p className="text-xs text-gray-400">Школьный портал</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Вход в систему</h1>
            <p className="text-sm text-gray-500 mt-1">Введите данные для входа</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="example@school.kz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400">Тестовые аккаунты</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword('password'); }}
                className={`p-3 rounded-xl border text-left transition hover:opacity-90 ${acc.color} ${email === acc.email ? 'ring-2 ring-blue-400' : ''}`}
              >
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${acc.badge}`}>{acc.role}</span>
                <p className="text-xs font-medium text-gray-800 mt-1.5 leading-tight">{acc.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div className="hidden md:flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Единый портал Aqbobek Lyceum</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Управляйте успеваемостью, расписанием и достижениями в одном месте.</p>
          <ul className="space-y-4">
            {[
              ['Аналитика успеваемости', 'Отслеживайте динамику оценок и посещаемости в реальном времени'],
              ['AI-тьютор', 'Персональные рекомендации и предиктивная аналитика пробелов в знаниях'],
              ['Умное расписание', 'Автоматическое составление расписания без конфликтов'],
              ['Достижения', 'Геймификация обучения — ачивки, лидерборды, цели'],
              ['Для родителей', 'Прозрачный мониторинг успехов ребёнка с AI-выжимкой за неделю'],
            ].map(([title, desc]) => (
              <li key={title} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
