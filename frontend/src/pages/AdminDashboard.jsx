import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { Card } from '../components/ui';

export const AdminDashboard = () => {
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Всего пользователей</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.users?.total || 0}</p>
            <p className="text-xs text-gray-600 mt-2">Активных: {stats?.users?.active || 0}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Верифицировано</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats?.users?.verified || 0}</p>
            <p className="text-xs text-gray-600 mt-2">Из {stats?.users?.total || 0}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Новые отзывы</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.feedback?.unread || 0}</p>
            <p className="text-xs text-gray-600 mt-2">Не прочитано</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Система</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">✅</p>
            <p className="text-xs text-gray-600 mt-2">Все системы работают</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="📊 Быстрые действия">
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors"
            >
              👥 Управление пользователями
            </Link>
            <Link
              to="/admin/subjects"
              className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors"
            >
              📚 Управление предметами
            </Link>
            <Link
              to="/admin/classes"
              className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors"
            >
              🏫 Управление классами
            </Link>
            <Link
              to="/admin/schedule"
              className="block p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 font-medium transition-colors"
            >
              📅 Управление расписанием
            </Link>
          </div>
        </Card>

        <Card title="⚙️ Дополнительно">
          <div className="space-y-2">
            <Link
              to="/admin/grades"
              className="block p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 font-medium transition-colors"
            >
              📝 Управление оценками
            </Link>
            <Link
              to="/admin/achievements"
              className="block p-3 bg-pink-50 hover:bg-pink-100 rounded-lg text-pink-700 font-medium transition-colors"
            >
              🏆 Управление достижениями
            </Link>
            <Link
              to="/admin/attendance"
              className="block p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg text-cyan-700 font-medium transition-colors"
            >
              ✅ Управление посещаемостью
            </Link>
            <Link
              to="/admin/logs"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors"
            >
              📋 Логи аудита
            </Link>
          </div>
        </Card>
      </div>

      <Card title="📢 Информация">
        <p className="text-gray-700">
          Добро пожаловать в админ панель Aqbobek Lyceum. Здесь вы можете управлять всеми аспектами школьной системы,
          включая пользователей, предметы, классы, расписание, оценки и достижения студентов.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
