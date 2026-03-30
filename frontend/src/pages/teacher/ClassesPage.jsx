import React, { useEffect, useMemo, useState } from 'react';
import { useStudentsStore } from '../../store/useStudentsStore';
import { useGradesStore } from '../../store/useGradesStore';

const CLASSES = ['10A', '10B'];
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

export default function ClassesPage() {
  const { students, fetchStudents } = useStudentsStore();
  const { grades, fetchGrades } = useGradesStore();
  const [selectedClass, setSelectedClass] = useState('10A');
  const [gradeEntry, setGradeEntry] = useState(null); // selected student
  const [form, setForm] = useState({ subject: SUBJECTS[0], grade: 4, type: 'lesson', weight: 1 });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const safe = Array.isArray(students) ? students : [];
    safe.forEach(s => fetchGrades(s.id));
  }, [students, fetchGrades]);

  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);
  const safeGrades   = useMemo(() => Array.isArray(grades)   ? grades   : [], [grades]);

  const classStudents = useMemo(
    () => safeStudents.filter(s => s.class === selectedClass),
    [safeStudents, selectedClass]
  );

  const studentCards = useMemo(() =>
    classStudents.map(s => {
      const sg  = safeGrades.filter(g => g.student_id === s.id);
      const avg = sg.length ? (sg.reduce((a, g) => a + g.grade, 0) / sg.length).toFixed(2) : null;
      const last = [...sg].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return { ...s, avg, lastGrade: last?.grade ?? null, count: sg.length };
    }),
  [classStudents, safeGrades]);

  const subjectStats = useMemo(() => {
    const classGrades = safeGrades.filter(g => classStudents.some(s => s.id === g.student_id));
    const map = {};
    classGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push(g.grade);
    });
    return Object.entries(map).map(([subj, list]) => ({
      subject: subj,
      count: list.length,
      avg: (list.reduce((a, b) => a + b, 0) / list.length).toFixed(2),
      min: Math.min(...list),
      max: Math.max(...list),
    }));
  }, [safeGrades, classStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setGradeEntry(null);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Мои классы</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление учениками и выставление оценок</p>
        </div>
        <div className="flex gap-1.5">
          {CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => { setSelectedClass(cls); setGradeEntry(null); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedClass === cls
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studentCards.map(s => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border p-4 transition-all ${
                  gradeEntry?.id === s.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={s.avatar} alt="" className="w-9 h-9 rounded-full bg-gray-100" />
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
                  {s.lastGrade ? (
                    <span className="text-xs text-gray-400">
                      Последняя: <span className={`font-bold ${gradeColor(s.lastGrade)} px-1.5 py-0.5 rounded text-xs`}>{s.lastGrade}</span>
                    </span>
                  ) : <span className="text-xs text-gray-300">Оценок нет</span>}
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

          {/* Subject stats */}
          {subjectStats.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Статистика по предметам · {selectedClass}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Предмет', 'Оценок', 'Среднее', 'Мин', 'Макс'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjectStats.map((s, i) => (
                      <tr key={s.subject} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                        <td className="py-2.5 px-3 font-medium text-gray-800">{s.subject}</td>
                        <td className="py-2.5 px-3 text-gray-500">{s.count}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold text-xs px-2 py-0.5 rounded ${gradeColor(parseFloat(s.avg))}`}>{s.avg}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{s.min}</td>
                        <td className="py-2.5 px-3 text-gray-500">{s.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Grade entry panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {gradeEntry ? `Оценка для: ${gradeEntry.full_name}` : 'Выставить оценку'}
          </h2>

          {!gradeEntry ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Выберите ученика из списка слева
            </p>
          ) : submitted ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">✓</p>
              <p className="text-emerald-600 font-semibold">Оценка сохранена!</p>
              <p className="text-xs text-gray-400 mt-1">{form.grade} по {form.subject}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Предмет</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, grade: v }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                        form.grade === v
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
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Вес</label>
                <div className="flex gap-2">
                  {WEIGHTS.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, weight: w }))}
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
                  className="flex-1 py-2.5 rounded-xl text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Сохранить
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
