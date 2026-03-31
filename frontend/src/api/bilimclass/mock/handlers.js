import { http, HttpResponse } from 'msw';
import { mockStudents, mockTeachers, mockParents } from '../data/students';
import { mockGrades, mockQuarterGrades, mockAttendance } from '../data/grades';
import { mockSchedule, mockAchievements } from '../data/schedule';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5252';

export const handlers = [
  // GET /api/students — список студентов
  http.get(`${API_BASE}/api/students`, () => {
    return HttpResponse.json({ data: mockStudents }, { status: 200 });
  }),

  // GET /api/students/:id — один студент
  http.get(`${API_BASE}/api/students/:id`, ({ params }) => {
    const student = mockStudents.find(s => s.id === parseInt(params.id));
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: student }, { status: 200 });
  }),

  // GET /api/grades?student_id=X — оценки студента
  http.get(`${API_BASE}/api/grades`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');
    const subject = url.searchParams.get('subject');
    
    let grades = mockGrades;
    
    if (studentId) {
      grades = grades.filter(g => g.student_id === parseInt(studentId));
    }
    if (subject) {
      grades = grades.filter(g => g.subject === subject);
    }
    
    return HttpResponse.json({ data: grades }, { status: 200 });
  }),

  // GET /api/quarter-grades?student_id=X — четвертные оценки
  http.get(`${API_BASE}/api/quarter-grades`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');
    const grades = studentId
      ? mockQuarterGrades.filter(g => g.student_id === parseInt(studentId))
      : mockQuarterGrades;
    return HttpResponse.json({ data: grades }, { status: 200 });
  }),

  // GET /api/attendance?student_id=X — посещаемость
  http.get(`${API_BASE}/api/attendance`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');
    const attendance = studentId
      ? mockAttendance.filter(a => a.student_id === parseInt(studentId))
      : mockAttendance;
    return HttpResponse.json({ data: attendance }, { status: 200 });
  }),

  // GET /api/schedule?class=10A — расписание класса
  http.get(`${API_BASE}/api/schedule`, ({ request }) => {
    const url = new URL(request.url);
    const className = url.searchParams.get('class');
    const schedule = className
      ? mockSchedule.filter(s => s.class === className)
      : mockSchedule;
    return HttpResponse.json({ data: schedule }, { status: 200 });
  }),

  // GET /api/teachers — список учителей
  http.get(`${API_BASE}/api/teachers`, () => {
    return HttpResponse.json({ data: mockTeachers }, { status: 200 });
  }),

  // GET /api/teachers/:id — один учитель
  http.get(`${API_BASE}/api/teachers/:id`, ({ params }) => {
    const teacher = mockTeachers.find(t => t.id === parseInt(params.id));
    if (!teacher) {
      return HttpResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: teacher }, { status: 200 });
  }),

  // GET /api/parents — список родителей
  http.get(`${API_BASE}/api/parents`, () => {
    return HttpResponse.json({ data: mockParents }, { status: 200 });
  }),

  // GET /api/achievements?student_id=X — достижения студента
  http.get(`${API_BASE}/api/achievements`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('student_id');
    const achievements = studentId
      ? mockAchievements.filter(a => a.student_id === parseInt(studentId))
      : mockAchievements;
    return HttpResponse.json({ data: achievements }, { status: 200 });
  }),
];
