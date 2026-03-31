const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5252';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Token expired - refresh or redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
  
  return response.json();
};

// ============================================================================
// 2. Student Grades - Example Integration
// ============================================================================

// Frontend Hook (React)
const useStudentGrades = (studentId) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!studentId) return;
    
    setLoading(true);
    apiCall(`/api/student/grades?weeks=4`)
      .then(data => {
        setGrades(data.data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);
  
  return { grades, loading, error };
};

// Usage:
// const { grades, loading } = useStudentGrades(user.id);
// grades.forEach(grade => console.log(grade.subject, grade.score));

// ============================================================================
// 3. Leaderboard - Example Integration
// ============================================================================

const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    apiCall('/api/student/leaderboard')
      .then(data => {
        setLeaderboard(data.data);
        setUserRank(data.user_rank);
      })
      .finally(() => setLoading(false));
  }, []);
  
  return { leaderboard, userRank, loading };
};

// ============================================================================
// 4. Schedule - Example Integration
// ============================================================================

const useStudentSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    apiCall('/api/student/schedule')
      .then(data => {
        setSchedule(data.grouped); // Grouped by day
      })
      .finally(() => setLoading(false));
  }, []);
  
  const getTodayLessons = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return schedule[today] || [];
  };
  
  return { schedule, getTodayLessons, loading };
};

// ============================================================================
// 5. Analytics - Example Integration
// ============================================================================

const useStudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    apiCall('/api/student/analytics')
      .then(data => setAnalytics(data.data))
      .finally(() => setLoading(false));
  }, []);
  
  const getRiskLevel = () => analytics?.risk.risk_level || 'normal';
  const getAverageScore = () => analytics?.average_score || 0;
  const getTrend = () => analytics?.trend || 0;
  
  return { 
    analytics, 
    getRiskLevel, 
    getAverageScore,
    getTrend,
    loading 
  };
};

// ============================================================================
// 6. Teacher - Risk Students
// ============================================================================

const useRiskStudents = () => {
  const [riskStudents, setRiskStudents] = useState([]);
  const [stats, setStats] = useState({ critical: 0, warning: 0 });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    apiCall('/api/teacher/risk-students')
      .then(data => {
        setRiskStudents(data.data);
        setStats({
          critical: data.critical_count,
          warning: data.warning_count,
        });
      })
      .finally(() => setLoading(false));
  }, []);
  
  return { riskStudents, stats, loading };
};

// ============================================================================
// 7. Teacher - Add Grade
// ============================================================================

const addGrade = async (studentId, subjectId, score, type = 'lesson') => {
  return apiCall('/api/teacher/grade', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      subject_id: subjectId,
      score: score,
      type: type,
      weight: 1.0,
      quarter: getCurrentQuarter(), // Функция определения четверти
    }),
  });
};

// Usage:
// await addGrade(5, 1, 5, 'test');

// ============================================================================
// 8. AI Report
// ============================================================================

const useAIReport = (studentId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const generateReport = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const data = await apiCall(`/api/ai/student-report/${studentId}`);
      setReport(data.ai_report);
    } finally {
      setLoading(false);
    }
  };
  
  return { report, generateReport, loading };
};

// Usage:
// const { report, generateReport } = useAIReport(studentId);
// <button onClick={generateReport}>Generate AI Report</button>
// {report && <div>{report.summary}</div>}

// ============================================================================
// 9. WebSocket Notifications
// ============================================================================

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    const ws = new WebSocket(
      `ws://${window.location.hostname}:5252/ws/notifications?token=${token}`
    );
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'notification':
          // Новые уведомление
          setNotifications(prev => [data.payload, ...prev]);
          playNotificationSound();
          break;
        
        case 'unread_count':
          // Количество непрочитанных
          setUnreadCount(data.payload.count);
          break;
        
        case 'ping':
          // Keep-alive
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    };
    
    ws.onerror = () => {
      console.error('WebSocket error');
    };
    
    return () => ws.close();
  }, []);
  
  const markAsRead = async (notificationId) => {
    await apiCall(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  };
  
  return { notifications, unreadCount, markAsRead };
};

// ============================================================================
// 10. Schedule Generation (Admin)
// ============================================================================

const generateSchedule = async () => {
  return apiCall('/api/schedule/generate', {
    method: 'POST',
    body: JSON.stringify({
      clear_existing: false, // Keep old schedule
    }),
  });
};

// Usage:
// const result = await generateSchedule();
// console.log(`Created ${result.data.schedules_created} schedule entries`);
// if (result.data.conflicts.length > 0) {
//   console.log('Conflicts:', result.data.conflicts);
// }

// ============================================================================
// 11. Achievement System
// ============================================================================

const useAchievements = (studentId) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, points: 0 });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!studentId) return;
    
    setLoading(true);
    apiCall(`/api/student/portfolio`)
      .then(data => {
        setAchievements(data.data);
        setStats(data.statistics);
      })
      .finally(() => setLoading(false));
  }, [studentId]);
  
  return { achievements, stats, loading };
};

// Usage:
// const { achievements } = useAchievements(user.id);
// achievements.map(a => <Achievement key={a.id} {...a} />)

// ============================================================================
// 12. Complete Store Example (Zustand)
// ============================================================================

import create from 'zustand';

export const useStudentStore = create((set, get) => ({
  // State
  grades: [],
  leaderboard: [],
  schedule: {},
  analytics: null,
  loading: false,
  error: null,
  
  // Actions
  fetchGrades: async (weeks = 4) => {
    set({ loading: true, error: null });
    try {
      const response = await apiCall(`/api/student/grades?weeks=${weeks}`);
      set({ grades: response.data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchLeaderboard: async () => {
    set({ loading: true });
    try {
      const response = await apiCall('/api/student/leaderboard');
      set({ leaderboard: response.data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchSchedule: async () => {
    set({ loading: true });
    try {
      const response = await apiCall('/api/student/schedule');
      set({ schedule: response.grouped });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchAnalytics: async () => {
    set({ loading: true });
    try {
      const response = await apiCall('/api/student/analytics');
      set({ analytics: response.data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  // Helpers
  getAverageScore: () => get().analytics?.average_score || 0,
  getRiskLevel: () => get().analytics?.risk.risk_level || 'normal',
  getTopSubject: () => {
    const analytics = get().analytics;
    if (!analytics?.by_subject?.length) return null;
    return analytics.by_subject[0];
  },
}));

// Usage:
// const { grades, fetchGrades, loading } = useStudentStore();
// useEffect(() => fetchGrades(4), []);
// {loading ? 'Loading...' : grades.map(g => <Grade {...g} />)}

// ============================================================================
// 13. Error Handling Wrapper
// ============================================================================

const apiCallWithErrorHandling = async (endpoint, options = {}) => {
  try {
    const response = await apiCall(endpoint, options);
    
    if (!response.success && response.error) {
      // Handle API error
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    // Show toast notification
    showErrorToast(error.message);
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================================================
// 14. Attendance Marking (Teacher)
// ============================================================================

const markAttendance = async (records) => {
  // records: [{ student_id, status, notes }]
  return apiCall('/api/teacher/mark-attendance', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
};

// Usage:
// const records = [
//   { student_id: 1, status: 'present' },
//   { student_id: 2, status: 'absent', notes: 'Sick' },
// ];
// await markAttendance(records);

// ============================================================================
// 15. Class Schedule (Teacher)
// ============================================================================

const useClassSchedule = (classId) => {
  const [schedule, setSchedule] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!classId) return;
    
    setLoading(true);
    apiCall(`/api/schedule/class/${classId}`)
      .then(data => {
        setSchedule(data.data);
        setGrouped(data.grouped);
      })
      .finally(() => setLoading(false));
  }, [classId]);
  
  return { schedule, grouped, loading };
};

// ============================================================================
// Export for use in React components
// ============================================================================

export {
  apiCall,
  apiCallWithErrorHandling,
  useStudentGrades,
  useLeaderboard,
  useStudentSchedule,
  useStudentAnalytics,
  useRiskStudents,
  useAIReport,
  useNotifications,
  useAchievements,
  useClassSchedule,
  addGrade,
  markAttendance,
  generateSchedule,
};
