import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotification } from '../hooks/useNotification';
import { Button } from '../components/ui/Button';

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
      error('Ошибка входа: ' + err.message);
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
