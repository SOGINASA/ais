export const mockGrades = [
  // Студент 1 (Айман) — Алгебра
  { id: 1, student_id: 1, subject: "Алгебра", teacher_id: 101, grade: 4, weight: 1, date: "2024-01-10", type: "lesson" },
  { id: 2, student_id: 1, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 1, date: "2024-01-12", type: "lesson" },
  { id: 3, student_id: 1, subject: "Алгебра", teacher_id: 101, grade: 3, weight: 2, date: "2024-01-15", type: "quiz" },
  { id: 4, student_id: 1, subject: "Алгебра", teacher_id: 101, grade: 4, weight: 2, date: "2024-01-20", type: "quiz" },
  { id: 5, student_id: 1, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 1, date: "2024-01-25", type: "lesson" },

  // Студент 1 (Айман) — Физика
  { id: 6, student_id: 1, subject: "Физика", teacher_id: 102, grade: 5, weight: 1, date: "2024-01-11", type: "lesson" },
  { id: 7, student_id: 1, subject: "Физика", teacher_id: 102, grade: 4, weight: 2, date: "2024-01-18", type: "lab" },
  { id: 8, student_id: 1, subject: "Физика", teacher_id: 102, grade: 5, weight: 1, date: "2024-01-22", type: "lesson" },

  // Студент 1 (Айман) — Казахский язык
  { id: 9, student_id: 1, subject: "Казахский язык", teacher_id: 103, grade: 4, weight: 1, date: "2024-01-13", type: "lesson" },
  { id: 10, student_id: 1, subject: "Казахский язык", teacher_id: 103, grade: 4, weight: 1, date: "2024-01-17", type: "lesson" },

  // Студент 2 (Айнур) — Алгебра (хорошистка)
  { id: 11, student_id: 2, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 1, date: "2024-01-10", type: "lesson" },
  { id: 12, student_id: 2, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 1, date: "2024-01-12", type: "lesson" },
  { id: 13, student_id: 2, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 2, date: "2024-01-15", type: "quiz" },
  { id: 14, student_id: 2, subject: "Алгебра", teacher_id: 101, grade: 4, weight: 2, date: "2024-01-20", type: "quiz" },
  { id: 15, student_id: 2, subject: "Алгебра", teacher_id: 101, grade: 5, weight: 1, date: "2024-01-25", type: "lesson" },

  // Студент 3 (Берик) — падает по физике
  { id: 16, student_id: 3, subject: "Физика", teacher_id: 102, grade: 4, weight: 1, date: "2024-01-11", type: "lesson" },
  { id: 17, student_id: 3, subject: "Физика", teacher_id: 102, grade: 3, weight: 2, date: "2024-01-18", type: "lab" },
  { id: 18, student_id: 3, subject: "Физика", teacher_id: 102, grade: 2, weight: 1, date: "2024-01-22", type: "lesson" },
  { id: 19, student_id: 3, subject: "Физика", teacher_id: 102, grade: 2, weight: 2, date: "2024-01-25", type: "quiz" },
];

export const mockQuarterGrades = [
  // 1-я четверть
  { student_id: 1, subject: "Алгебра", quarter: 1, grade: 4, year: 2024 },
  { student_id: 1, subject: "Физика", quarter: 1, grade: 5, year: 2024 },
  { student_id: 1, subject: "Казахский язык", quarter: 1, grade: 4, year: 2024 },

  { student_id: 2, subject: "Алгебра", quarter: 1, grade: 5, year: 2024 },
  { student_id: 2, subject: "Физика", quarter: 1, grade: 5, year: 2024 },

  { student_id: 3, subject: "Физика", quarter: 1, grade: 3, year: 2024 },
  { student_id: 3, subject: "Алгебра", quarter: 1, grade: 4, year: 2024 },
];

export const mockAttendance = [
  // Айман (student_id: 1)
  { id: 1, student_id: 1, subject: "Алгебра", date: "2024-01-10", status: "present" },
  { id: 2, student_id: 1, subject: "Алгебра", date: "2024-01-12", status: "present" },
  { id: 3, student_id: 1, subject: "Алгебра", date: "2024-01-15", status: "absent" },
  { id: 4, student_id: 1, subject: "Физика", date: "2024-01-11", status: "present" },
  { id: 5, student_id: 1, subject: "Физика", date: "2024-01-18", status: "present" },

  // Берик (student_id: 3) — пропускает физику
  { id: 6, student_id: 3, subject: "Физика", date: "2024-01-11", status: "absent" },
  { id: 7, student_id: 3, subject: "Физика", date: "2024-01-18", status: "present" },
  { id: 8, student_id: 3, subject: "Физика", date: "2024-01-22", status: "absent" },
];
