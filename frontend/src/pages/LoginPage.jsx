import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotification } from '../hooks/useNotification';
import { Button } from '../components/ui/Button';

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
      success('Вы успешно вошли в систему!');
    } catch (err) {
      error('Ошибка входа: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const mockAccounts = [
    { email: 'ayman@school.kz', role: 'Студент 10A' },
    { email: 'daria@school.kz', role: 'Учитель Математики' },
    { email: 'zhanna.smagulova@example.kz', role: 'Родитель' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎓 Aqbobek Lyceum</h1>
          <p className="text-gray-600 text-lg mb-8">Школьный портал</p>

          <form onSubmit={handleLogin} className="space-y-6 mb-8">
            <div>
              <label htmlFor="email" className="block font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.kz"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold text-gray-800 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Войти
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Тестовые аккаунты</span>
            </div>
          </div>

          <div className="space-y-2">
            {mockAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('password');
                }}
                className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors"
              >
                <div className="font-semibold text-gray-900">{account.email}</div>
                <div className="text-sm text-gray-600 mt-1">{account.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Возможности портала</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-lg">
              <span>📊</span>
              <span>Отслеживание оценок и успеваемости</span>
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span>🤖</span>
              <span>AI-тьютор с предиктивной аналитикой</span>
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span>📅</span>
              <span>Интеллектуальное расписание</span>
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span>🏆</span>
              <span>Достижения и геймификация</span>
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span>👨‍👩‍👧‍👦</span>
              <span>Связь с родителями в реальном времени</span>
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span>📱</span>
              <span>Доступно на всех устройствах</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
