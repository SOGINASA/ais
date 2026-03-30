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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { success, error } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      success('Вы успешно вошли в систему!');
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎓 Aqbobek Lyceum</h1>
          <p className="text-gray-600 text-lg mb-8">Школьный портал</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block font-semibold text-gray-800 mb-2">
                Email или никнейм
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="example@school.kz или username"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
