import { create } from 'zustand';
import bilimClassClient from '../api/bilimclass/client';

export const useAdminStore = create((set, get) => ({
  // Data
  users: [],
  subjects: [],
  classes: [],
  schedule: [],
  grades: [],
  achievements: [],
  attendance: [],
  stats: null,
  auditLogs: [],

  // UI state
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  error: null,

  // ==================== STATS ====================
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.get('/admin/stats');
      set({ stats: res, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  // ==================== USERS ====================
  fetchUsers: async (page = 1, search = '', perPage = 20) => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.get('/admin/users', {
        params: { page, per_page: perPage, search },
      });
      set({
        users: res.users || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ users: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  deactivateUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post(`/admin/users/${userId}/deactivate`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  activateUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post(`/admin/users/${userId}/activate`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== SUBJECTS ====================
  fetchSubjects: async (page = 1, search = '') => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.get('/admin/subjects', {
        params: { page, per_page: 20, search },
      });
      set({
        subjects: res.subjects || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ subjects: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createSubject: async (data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post('/admin/subjects', data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  updateSubject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/subjects/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteSubject: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/subjects/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== CLASSES ====================
  fetchClasses: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.get('/admin/classes', {
        params: { page, per_page: 20 },
      });
      set({
        classes: res.classes || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ classes: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createClass: async (data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post('/admin/classes', data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  updateClass: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/classes/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteClass: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/classes/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== SCHEDULE ====================
  fetchSchedule: async (page = 1, perPage = 50, classId = null) => {
    set({ loading: true, error: null });
    try {
      const params = { page, per_page: perPage };
      if (classId) params.class_id = classId;
      const res = await bilimClassClient.get('/admin/schedule', { params });
      set({
        schedule: res.schedules || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ schedule: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createSchedule: async (data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post('/admin/schedule', data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  updateSchedule: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/schedule/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteSchedule: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/schedule/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== GRADES ====================
  getGrades: async (page = 1, perPage = 50, studentId = null) => {
    set({ loading: true, error: null });
    try {
      const params = { page, per_page: perPage };
      if (studentId) params.student_id = studentId;
      const res = await bilimClassClient.get('/admin/grades', { params });
      set({
        grades: res.grades || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ grades: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  updateGrade: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/grades/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteGrade: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/grades/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== ACHIEVEMENTS ====================
  getAchievements: async (page = 1, perPage = 50, studentId = null) => {
    set({ loading: true, error: null });
    try {
      const params = { page, per_page: perPage };
      if (studentId) params.student_id = studentId;
      const res = await bilimClassClient.get('/admin/achievements', { params });
      set({
        achievements: res.achievements || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ achievements: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createAchievement: async (data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post('/admin/achievements', data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  updateAchievement: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/achievements/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteAchievement: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/achievements/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== ATTENDANCE ====================
  getAttendance: async (page = 1, perPage = 50, studentId = null, status = null) => {
    set({ loading: true, error: null });
    try {
      const params = { page, per_page: perPage };
      if (studentId) params.student_id = studentId;
      if (status) params.status = status;
      const res = await bilimClassClient.get('/admin/attendance', { params });
      set({
        attendance: res.attendance || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ attendance: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createAttendance: async (data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.post('/admin/attendance', data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  updateAttendance: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.put(`/admin/attendance/${id}`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  deleteAttendance: async (id) => {
    set({ loading: true, error: null });
    try {
      await bilimClassClient.delete(`/admin/attendance/${id}`);
      set({ loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // ==================== AUDIT LOGS ====================
  fetchAuditLogs: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const res = await bilimClassClient.get('/admin/audit-logs', {
        params: { page, per_page: 50 },
      });
      set({
        auditLogs: res.logs || [],
        pagination: { total: res.total, page: res.page, pages: res.pages },
        loading: false,
      });
    } catch (err) {
      set({ auditLogs: [], error: err.response?.data?.error || err.message, loading: false });
    }
  },
}));

export default useAdminStore;
