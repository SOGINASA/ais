import React, { useEffect, useMemo, useState } from 'react';
import { useStudentsStore } from '../../store/useStudentsStore';
import { studentsApi } from '../../api/bilimclass/students';

const SUBJECTS = ['Алгебра', 'Геометрия', 'Физика', 'Казахский язык', 'Английский язык', 'История'];
const TYPES = [
  { value: 'lesson', label: 'Урок' },
  { value: 'quiz', label: 'Контрольная' },
  { value: 'lab', label: 'Лаб. работа' },
];
const WEIGHTS = [1, 2, 3];

const gradeColor = (g) => {
  if (g >= 5) return 'bg-emerald-100 text-emerald-700';
  if (g >= 4) return 'bg-blue-100 text-blue-700';
  if (g >= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const riskBadge = (level) => {
  if (level === 'low') return 'bg-emerald-100 text-emerald-700';
  if (level === 'medium') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const riskLabel = (level) =>
  level === 'low' ? 'норма' : level === 'medium' ? 'внимание' : 'риск';

export default function TeacherGradesPage() {
  const { classes, students, loading, fetchTeacherClasses, fetchClassStudents } = useStudentsStore();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeEntry, setGradeEntry] = useState(null);
  const [form, setForm] = useState({ subject: SUBJECTS[0], score: 4, type: 'lesson', weight: 1 });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  useEffect(() => {
    const safe = Array.isArray(classes) ? classes : [];
    if (safe.length > 0 && !selectedClassId) {
      const id = safe[0].id;
      setSelectedClassId(id);
      fetchClassStudents(id);
    }
  }, [classes, selectedClassId, fetchClassStudents]);

  const safeClasses = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
  const safeStudents = useMemo(() => (Array.isArray(students) ? students : []), [students]);

  const studentCards = useMemo(() =>
    safeStudents.map((item) => {
      const user = item.user ?? item;
      const analytics = item.analytics ?? {};
      return {
        id: user.id,
        full_name: user.full_name,
        avatar: user.avatar,
        avg: analytics.average_score != null ? Number(analytics.average_score).toFixed(2) : null,
        count: analytics.grades_count ?? 0,
        risk_level: analytics.risk_level ?? null,
      };
    }),
  [safeStudents]);

  const filtered = useMemo(() => {
    if (!search.trim()) return studentCards;
    const q = search.toLowerCase();
    return studentCards.filter((s) => s.full_name?.toLowerCase().includes(q));
  }, [studentCards, search]);

  const handleClassSelect = (id) => {
    setSelectedClassId(id);
    setGradeEntry(null);
    setSearch('');
    fetchClassStudents(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gradeEntry) return;
    setSaving(true);
    try {
      await studentsApi.addGrade({
        student_id: gradeEntry.id,
        subject: form.subject,
        score: form.score,
        type: form.type,
        weight: form.weight,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setGradeEntry(null);
        if (selectedClassId) fetchClassStudents(selectedClassId);
      }, 2000);
    } catch {
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
          <h1 className="text-xl font-bold text-gray-900">Оценки</h1>
          <p className="text-sm text-gray-500 mt-0.5">Выставление оценок ученикам</p>
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

      {/* Search */}
      <input
        type="text"
        placeholder="Поиск по имени..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && <p className="text-gray-400 text-sm">Загрузка...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student list */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              {search ? 'Ученики не найдены' : 'Выберите класс'}
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border p-4 transition-all ${
                gradeEntry?.id === s.id
                  ? 'border-blue-300 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`}
                  alt=""
                  className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{s.count} оценок</span>
                    {s.risk_level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskBadge(s.risk_level)}`}>
                        {riskLabel(s.risk_level)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {s.avg && (
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${gradeColor(parseFloat(s.avg))}`}>
                      {s.avg}
                    </span>
                  )}
                  <button
                    onClick={() => { setGradeEntry(s); setSubmitted(false); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition whitespace-nowrap"
                  >
                    + Оценка
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade entry panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit sticky top-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {gradeEntry ? `Оценка: ${gradeEntry.full_name}` : 'Выставить оценку'}
          </h2>

          {!gradeEntry ? (
            <p className="text-sm text-gray-400 text-center py-8">Выберите ученика из списка</p>
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
