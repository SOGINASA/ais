# Aqbobek Lyceum Portal - Frontend

Многоролевой школьный портал с AI-аналитикой и умным модулем расписания.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в development

```bash
npm start
```

Приложение откроется на `http://localhost:3000`

### Установка MSW (Mock Service Worker)

MSW уже настроен в `src/index.js`. Он автоматически перехватывает API запросы в development режиме.

## 📁 Структура проекта

```
src/
├── api/
│   └── bilimclass/               # BilimClass API client & mocks
│       ├── client.js             # Axios instance
│       ├── grades.js             # Grades API
│       ├── students.js           # Students API
│       ├── schedule.js           # Schedule API
│       ├── attendance.js         # Attendance API
│       ├── achievements.js       # Achievements API
│       ├── index.js              # API exports
│       ├── data/                 # Mock data
│       │   ├── students.js
│       │   ├── grades.js
│       │   └── schedule.js
│       └── mock/                 # MSW setup
│           ├── handlers.js       # MSW handlers
│           └── worker.js         # Browser worker
│
├── store/                         # Zustand stores
│   ├── useAuthStore.js
│   ├── useGradesStore.js
│   ├── useStudentsStore.js
│   ├── useAttendanceStore.js
│   ├── useScheduleStore.js
│   ├── useAchievementsStore.js
│   ├── useUIStore.js
│   └── index.js
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.js
│   ├── useStudentGrades.js
│   ├── useNotification.js
│   ├── useClassSchedule.js
│   └── index.js
│
├── components/
│   ├── ui/                        # Design System
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   └── index.js
│   └── NotificationContainer.jsx
│
├── App.js
└── index.js
```

## 🎯 Использование

### Загрузка оценок студента

```javascript
import { useStudentGrades } from './hooks/useStudentGrades';

function GradesComponent() {
  const { grades, quarterGrades, loading, error } = useStudentGrades(1);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      {grades.map(g => (
        <div key={g.id}>{g.subject}: {g.grade}</div>
      ))}
    </div>
  );
}
```

### Использование уведомлений

```javascript
import { useNotification } from './hooks/useNotification';

function MyComponent() {
  const { success, error, warning } = useNotification();

  const handleAction = () => {
    success('Операция успешна!');
    error('Произошла ошибка!');
    warning('Внимание!');
  };

  return <button onClick={handleAction}>Действие</button>;
}
```

### Работа с авторизацией

```javascript
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/useAuthStore';

function LoginComponent() {
  const { user, isAuthenticated } = useAuth();
  const { login, logout } = useAuthStore();

  return (
    <>
      {isAuthenticated ? (
        <div>
          <p>Привет, {user.full_name}</p>
          <button onClick={logout}>Выход</button>
        </div>
      ) : (
        <button onClick={() => login('ayman@school.kz', 'password')}>
          Вход
        </button>
      )}
    </>
  );
}
```

## 📦 API Endpoints (Mock)

### Оценки
- `GET /api/grades?student_id=X` - Оценки студента
- `GET /api/grades?student_id=X&subject=Y` - Оценки по предмету
- `GET /api/quarter-grades?student_id=X` - Четвертные оценки

### Студенты
- `GET /api/students` - Список студентов
- `GET /api/students/:id` - Студент по ID

### Расписание
- `GET /api/schedule?class=10A` - Расписание класса

### Посещаемость
- `GET /api/attendance?student_id=X` - Посещаемость студента

### Достижения
- `GET /api/achievements?student_id=X` - Достижения студента

### Учители
- `GET /api/teachers` - Список учителей
- `GET /api/teachers/:id` - Учитель по ID

### Родители
- `GET /api/parents` - Список родителей

## 🎨 UI Компоненты

### Button
```javascript
import { Button } from './components/ui';

<Button variant="primary" size="md" onClick={() => {}}>
  Click me
</Button>

// Варианты: primary, secondary, danger, success
// Размеры: sm, md, lg
```

### Card
```javascript
import { Card } from './components/ui';

<Card title="My Card">
  Content here
</Card>
```

### Badge
```javascript
import { Badge } from './components/ui';

<Badge variant="success">Success</Badge>

// Варианты: primary, success, warning, danger, info
```

## 🔄 Zustand Store API

### useAuthStore
```javascript
const { user, isAuthenticated, role, login, logout, restoreSession } = useAuthStore();
```

### useGradesStore
```javascript
const { 
  grades, 
  quarterGrades, 
  fetchGrades, 
  fetchQuarterGrades,
  getAverageBySubject,
  getSubjects 
} = useGradesStore();
```

### useScheduleStore
```javascript
const { 
  schedule, 
  fetchSchedule, 
  getScheduleByDay,
  getWeekSchedule 
} = useScheduleStore();
```

## 🧪 Testing

Для тестирования API используются mock данные из `src/api/bilimclass/data/`.

Вы можете изменять mock данные прямо в файлах:
- `/src/api/bilimclass/data/students.js`
- `/src/api/bilimclass/data/grades.js`
- `/src/api/bilimclass/data/schedule.js`

## 🌍 Environment Variables

Создайте `.env` файл в корне `frontend/`:

```
REACT_APP_API_BASE=http://localhost:5252
REACT_APP_ENV=development
REACT_APP_MOCK_API_ENABLED=true
```

## 📝 TODO

- [ ] Страница авторизации (Login)
- [ ] Дашборд студента
- [ ] Дашборд учителя с Early Warning System
- [ ] Дашборд родителя
- [ ] Дашборд администратора
- [ ] AI тьютор и предиктивная аналитика
- [ ] Smart Schedule алгоритм
- [ ] Kiosk Mode
- [ ] Web Push уведомления
- [ ] WebSocket для real-time обновлений

## 🛠 Технологический стек

- **React 18** - UI фреймворк
- **Zustand** - Управление состоянием
- **Axios** - HTTP клиент
- **MSW** - Mock Service Worker
- **CSS3** - Стили

## 📄 Лицензия

MIT
