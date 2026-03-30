import axios from 'axios';
import { mockStudents, mockTeachers, mockParents } from './data/students';
import { mockGrades, mockQuarterGrades, mockAttendance } from './data/grades';
import { mockSchedule, mockAchievements } from './data/schedule';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

const mockData = {
  students: mockStudents,
  teachers: mockTeachers,
  parents: mockParents,
  grades: mockGrades,
  quarterGrades: mockQuarterGrades,
  attendance: mockAttendance,
  schedule: mockSchedule,
  achievements: mockAchievements,
};

const createMockResponse = (data) => {
  return Promise.resolve({ data });
};

export const bilimClassClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

bilimClassClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

bilimClassClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (USE_MOCK) {
      console.warn('API Error, using mock data:', error.message);
      return Promise.resolve({ data: [] });
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const mockApiRequest = (endpoint, params = {}) => {
  if (endpoint === '/students') {
    return createMockResponse({ data: mockData.students });
  }
  if (endpoint.startsWith('/students/')) {
    const id = parseInt(endpoint.split('/')[2]);
    const student = mockData.students.find(s => s.id === id);
    return student ? createMockResponse({ data: student }) : Promise.reject({ status: 404 });
  }
  if (endpoint === '/grades') {
    let grades = mockData.grades;
    if (params.student_id) {
      grades = grades.filter(g => g.student_id === parseInt(params.student_id));
    }
    if (params.subject) {
      grades = grades.filter(g => g.subject === params.subject);
    }
    return createMockResponse({ data: grades });
  }
  if (endpoint === '/quarter-grades') {
    let grades = mockData.quarterGrades;
    if (params.student_id) {
      grades = grades.filter(g => g.student_id === parseInt(params.student_id));
    }
    return createMockResponse({ data: grades });
  }
  if (endpoint === '/attendance') {
    let attendance = mockData.attendance;
    if (params.student_id) {
      attendance = attendance.filter(a => a.student_id === parseInt(params.student_id));
    }
    return createMockResponse({ data: attendance });
  }
  if (endpoint === '/schedule') {
    let schedule = mockData.schedule;
    if (params.class) {
      schedule = schedule.filter(s => s.class === params.class);
    }
    return createMockResponse({ data: schedule });
  }
  if (endpoint === '/achievements') {
    let achievements = mockData.achievements;
    if (params.student_id) {
      achievements = achievements.filter(a => a.student_id === parseInt(params.student_id));
    }
    return createMockResponse({ data: achievements });
  }
  if (endpoint === '/teachers') {
    return createMockResponse({ data: mockData.teachers });
  }
  if (endpoint.startsWith('/teachers/')) {
    const id = parseInt(endpoint.split('/')[2]);
    const teacher = mockData.teachers.find(t => t.id === id);
    return teacher ? createMockResponse({ data: teacher }) : Promise.reject({ status: 404 });
  }
  if (endpoint === '/parents') {
    return createMockResponse({ data: mockData.parents });
  }

  return createMockResponse({ data: [] });
};

export default bilimClassClient;

