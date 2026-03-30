import React, { useEffect, useMemo } from 'react';
import { useStudentGrades } from '../hooks/useStudentGrades';
import { useAuth } from '../hooks/useAuth';
import { useClassSchedule } from '../hooks/useClassSchedule';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { Card, Badge } from '../components/ui';
import GradesCard from '../components/GradesCard';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { grades } = useStudentGrades(user?.id);
  const { weekSchedule } = useClassSchedule(user?.class);
  const achievements = useAchievementsStore((state) => state.achievements);
  const fetchAchievements = useAchievementsStore((state) => state.fetchAchievements);
  const attendance = useAttendanceStore((state) => state.attendance);
  const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance);

  useEffect(() => {
    if (user?.id) {
      fetchAchievements(user.id);
      fetchAttendance(user.id);
    }
  }, [user?.id, fetchAchievements, fetchAttendance]);

  const attendanceStats = useMemo(() => {
    const safe = Array.isArray(attendance) ? attendance : [];
    const present = safe.filter((a) => a.status === 'present').length;
    const absent = safe.filter((a) => a.status === 'absent').length;
    const total = safe.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    return { present, absent, total, percentage };
  }, [attendance]);

  const groupedGrades = grades.reduce((acc, grade) => {
    const subject = grade.subject;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(grade);
    return acc;
  }, {});

  const calculateAverage = (subjectGrades) => {
    if (subjectGrades.length === 0) return 0;
    const weighted = subjectGrades.reduce((sum, g) => sum + g.grade * g.weight, 0);
    const totalWeight = subjectGrades.reduce((sum, g) => sum + g.weight, 0);
    return weighted / totalWeight;
  };

  const todaySchedule = weekSchedule[0]?.lessons || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Средний балл</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {Object.keys(groupedGrades).length > 0
                ? (
                    Object.values(groupedGrades)
                      .map(calculateAverage)
                      .reduce((a, b) => a + b, 0) / Object.keys(groupedGrades).length
                  ).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Посещаемость</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{attendanceStats.percentage}%</p>
            <p className="text-xs text-gray-600 mt-2">{attendanceStats.present} присутствий</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Достижения</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{achievements.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Оценок выставлено</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{grades.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="📝 Мои предметы" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupedGrades).map(([subject, subjectGrades]) => (
                <GradesCard
                  key={subject}
                  subject={subject}
                  average={calculateAverage(subjectGrades)}
                  count={subjectGrades.length}
                  recentGrades={subjectGrades.slice(-5)}
                />
              ))}
            </div>
          </Card>

          <Card title="📅 Расписание на сегодня">
            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{lesson.subject}</p>
                      <p className="text-sm text-gray-600">
                        Кабинет {lesson.room} • {lesson.start_time} - {lesson.end_time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{lesson.teacher_name}</p>
                    </div>
                    <Badge variant="info">{lesson.lesson_type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Нет уроков на сегодня</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="🏆 Последние достижения">
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет достижений пока</p>
            )}
          </Card>

          <Card title="📊 Быстрые ссылки">
            <div className="space-y-2">
              <a
                href="/ai-tutor"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors text-sm"
              >
                🤖 Запустить AI тьютор
              </a>
              <a
                href="/grades"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors text-sm"
              >
                📈 Подробная статистика
              </a>
              <a
                href="/schedule"
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors text-sm"
              >
                📅 Полное расписание
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;