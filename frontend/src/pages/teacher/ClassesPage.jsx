import React, { useEffect, useMemo, useState } from 'react';
import { useStudentsStore } from '../../store/useStudentsStore';
import { studentsApi } from '../../api/bilimclass/students';

const SUBJECTS = ['Алгебра', 'Геометрия', 'Физика', 'Казахский язык', 'Английский язык', 'История'];
const TYPES = [
  { value: 'lesson', label: 'Урок' },
  { value: 'quiz',   label: 'Контрольная' },
  { value: 'lab',    label: 'Лаб. работа' },
];
const WEIGHTS = [1, 2, 3];

const gradeColor = (g) => {
  if (g >= 5) return 'bg-emerald-100 text-emerald-700';
  if (g >= 4) return 'bg-blue-100 text-blue-700';
  if (g >= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const riskColor = (level) => {
  if (level === 'low') return 'bg-emerald-100 text-emerald-700';
  if (level === 'medium') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export default function ClassesPage() {
  const { classes, students, loading, fetchTeacherClasses, fetchClassStudents } = useStudentsStore();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [gradeEntry, setGradeEntry] = useState(null);
  const [form, setForm] = useState({ subject: SUBJECTS[0], score: 4, type: 'lesson', weight: 1 });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  // Auto-select first class
  useEffect(() => {
    const safeClasses = Array.isArray(classes) ? classes : [];
    if (safeClasses.length > 0 && !selectedClassId) {
      const firstId = safeClasses[0].id;
      setSelectedClassId(firstId);
      fetchClassStudents(firstId);
    }
  }, [classes, selectedClassId, fetchClassStudents]);

  const safeClasses  = useMemo(() => Array.isArray(classes)  ? classes  : [], [classes]);
  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);

  // Students come as [{user: {...}, analytics: {...}}]
  const studentCards = useMemo(() =>
    safeStudents.map((item) => {
      const user      = item.user ?? item;
      const analytics = item.analytics ?? {};
      return {
        id:          user.id,
        full_name:   user.full_name,
        avatar:      user.avatar,
        avg:         analytics.average_score != null ? Number(analytics.average_score).toFixed(2) : null,
        count:       analytics.grades_count ?? 0,
        risk_level:  analytics.risk_level ?? null,
        attendance:  analytics.attendance_rate != null ? Math.round(analytics.attendance_rate * 100) : null,
      };
    }),
  [safeStudents]);

  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    setGradeEntry(null);
    fetchClassStudents(classId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gradeEntry) return;
    setSaving(true);
    try {
      await studentsApi.addGrade({
        student_id: gradeEntry.id,
        subject:    form.subject,
        score:      form.score,
        type:       form.type,
        weight:     form.weight,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setGradeEntry(null);
        // Refresh students
        if (selectedClassId) fetchClassStudents(selectedClassId);
      }, 2000);
    } catch (err) {
      alert('Ошибка при сохранении оценки');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Мои классы</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление учениками и выставление оценок</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {safeClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleClassSelect(cls.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedClassId === cls.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Загрузка...</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studentCards.map((s) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border p-4 transition-all ${
                  gradeEntry?.id === s.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`}
                    alt=""
                    className="w-9 h-9 rounded-full bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-400">{s.count} оценок</p>
                  </div>
                  {s.avg && (
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${gradeColor(parseFloat(s.avg))}`}>
                      {s.avg}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {s.risk_level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor(s.risk_level)}`}>
                        {s.risk_level === 'low' ? 'норма' : s.risk_level === 'medium' ? 'внимание' : 'риск'}
                      </span>
                    )}
                    {s.attendance != null && (
                      <span className="text-xs text-gray-400">{s.attendance}%</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setGradeEntry(s); setSubmitted(false); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    + Оценка
                  </button>
                </div>
              </div>
            ))}
          </div>

          {studentCards.length === 0 && !loading && selectedClassId && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              Ученики не найдены
            </div>
          )}
        </div>

        {/* Grade entry panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {gradeEntry ? `Оценка для: ${gradeEntry.full_name}` : 'Выставить оценку'}
          </h2>

          {!gradeEntry ? (
            <p className="text-sm text-gray-400 text-center py-8">Выберите ученика из списка слева</p>
          ) : submitted ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-600 font-semibold">Оценка сохранена!</p>
              <p className="text-xs text-gray-400 mt-1">{form.score} по {form.subject}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Предмет</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, score: v }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                        form.score === v
                          ? `${gradeColor(v)} ring-2 ring-offset-1 ring-current`
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Тип</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Вес</label>
                <div className="flex gap-2">
                  {WEIGHTS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, weight: w }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                        form.weight === w ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      ×{w}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradeEntry(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
