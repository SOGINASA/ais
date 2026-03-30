# 🎓 Aqbobek Lyceum Backend - Setup Guide

## Quick Start

### 1️⃣ Утсновка

```bash
cd backend

# Виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Зависимости
pip install -r requirements.txt
```

### 2️⃣ Конфигурация (`.env`)

```bash
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key

# Database (опционально, по умолчанию SQLite)
DATABASE_URL=sqlite:///database.db

# Groq API (опционально - для AI анализа)
GROQ_API_KEY=gsk_...

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3️⃣ Инициализация БД и Demo данные

```bash
# Создаем таблицы
python -c "from app import create_app; app = create_app(); app.app_context().push()"

# Заполняем demo данными
python seed.py
```

### 4️⃣ Запуск

```bash
python app.py
```

Сервер: `http://localhost:5000`

---

## 📊 Database Schema

### Core Models

```python
User
├── role: 'student' | 'teacher' | 'parent' | 'admin'
├── class_name: '10A'  # для студентов
├── phone, birthday
└── relationships
    ├── grades_as_student
    ├── grades_as_teacher
    ├── schedules
    └── achievements

Subject
├── name: 'Алгебра'
├── code: 'MATH'
└── grades, schedules

Grade
├── student_id, subject_id, teacher_id
├── score: 1-5
├── type: 'lesson' | 'lab' | 'quiz' | 'test' | 'exam'
├── weight: 1.0  # вес для среднего
├── date, quarter
└── relationships to User, Subject

ClassModel
├── name: '10A'
├── grade_level: 10
├── teacher_id  # классный руководитель
└── schedules

Schedule
├── class_id, teacher_id, subject_id
├── day_of_week: 0-6
├── time_slot: 1-7
├── start_time, end_time
├── room: '101'
└── relationships to ClassModel, User, Subject

Achievement
├── student_id
├── title, description, icon
├── type: 'grades' | 'olympiad' | 'attendance'
├── points: int
└── achieved_at: datetime

Attendance
├── student_id, schedule_id
├── date
├── status: 'present' | 'absent' | 'late' | 'excused'
├── marked_by_id
└── notes

AnalyticsSnapshot
├── student_id
├── average_score, scores_trend
├── risk_level: 'normal' | 'warning' | 'critical'
└── metadata: JSON
```

---

## 🚀 API Routes

### Student API

```
GET  /api/student/grades               ← Оценки
GET  /api/student/quarter-grades       ← Четвертные оценки
GET  /api/student/leaderboard          ← Рейтинг класса
GET  /api/student/portfolio            ← Достижения
GET  /api/student/schedule             ← Расписание
GET  /api/student/attendance           ← Посещаемость
GET  /api/student/analytics            ← Полная аналитика
```

### Teacher API

```
GET  /api/teacher/classes              ← Мои классы
GET  /api/teacher/class/:id/students   ← Студенты класса
GET  /api/teacher/risk-students        ← Студенты в риске
POST /api/teacher/grade                ← Добавить оценку (score, subject_id, student_id)
POST /api/teacher/mark-attendance      ← Посещаемость (records[])
POST /api/teacher/report/:id           ← AI отчет
```

### AI API

```
GET  /api/ai/student-report/:id        ← Подробный отчет + AI анализ
GET  /api/ai/class-report/:id          ← Отчет по классу
GET  /api/ai/predictions/:id           ← Предсказания
GET  /api/ai/subject-analysis/:id/:id  ← Анализ по предмету
```

### Schedule API

```
GET  /api/schedule/class/:id           ← Расписание класса
GET  /api/schedule/teacher/:id         ← Расписание учителя
GET  /api/schedule/student/:id         ← Расписание студента
POST /api/schedule/generate            ← Генерировать (ADMIN)
POST /api/schedule/recalculate         ← Проверить конфликты
PUT  /api/schedule/:id                 ← Обновить комнату/время
```

---

## 🔑 Test Accounts

После запуска `python seed.py`:

```
Admin:    admin@school.com    / admin123
Teacher:  teacher1@school.com / teacher123
Student:  student1@school.com / student123
```

---

## 🤖 AI Service

### Без Groq (Mock Response)

Автоматически если `GROQ_API_KEY` не установлен.

```python
analyzer = AIAnalyzer()
report = analyzer.analyze_student(student_id=5)
# → Mock response с анализом
```

### С Groq API

```bash
pip install groq
export GROQ_API_KEY=gsk_...
```

```python
analyzer = AIAnalyzer()
report = analyzer.analyze_student(student_id=5)
# → Real Groq response
```

**Response**:
```json
{
  "summary": "string",
  "strengths": ["array"],
  "weaknesses": ["array"],
  "recommendations": ["array"]
}
```

---

## 📅 Schedule Generation

### Greedy Algorithm

1. Для каждого класса → для каждого дня → для каждого урока
2. Выбираем учителя (не занят), кабинет (свободен)
3. Создаем Schedule запись

### Ограничения

- ✅ Учитель не может вести 2 урока одновременно
- ✅ Кабинет не пересекается
- ✅ Класс не пересекается

### Использование

```bash
# API
POST /api/schedule/generate
{
  "clear_existing": false  # сохранить старое расписание
}

# Python
from services.scheduler_service import ScheduleGenerator

gen = ScheduleGenerator()
result = gen.generate_schedule(classes, teachers, subjects)
```

---

## 📊 Analytics

### StudentAnalytics

```python
from services.analytics_service import StudentAnalytics

# Средний балл
avg = StudentAnalytics.calculate_average_score(student_id)
# → 4.3

# Тренд за последние 2 недели
trend = StudentAnalytics.calculate_trend(student_id)
# → 5.2 (%)

# Риск падения оценок
risk = StudentAnalytics.detect_risk(student_id)
# → {
#   'risk_level': 'critical',
#   'reasons': ['Низкий балл', 'Падение -20%'],
#   'score': 75.0
# }

# По предметам
by_subject = StudentAnalytics.get_subject_performance(student_id)
# → [{'subject': 'Алгебра', 'average': 4.5, ...}]

# Посещаемость
attendance = StudentAnalytics.get_attendance_stats(student_id)
# → {'total': 25, 'present': 23, 'absent': 1, ...}

# Полная аналитика
full = StudentAnalytics.get_full_analytics(student_id)
# → All metrics above
```

---

## 🔔 WebSocket Notifications

### Подключение

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:5000/ws/notifications?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'notification':
      console.log('Notification:', data.payload);
      break;
    case 'unread_count':
      console.log('Unread:', data.payload.count);
      break;
    case 'ping':
      ws.send(JSON.stringify({type: 'pong'}));
      break;
  }
};
```

### Notification Payload

```javascript
{
  id: 1,
  title: 'Grade Added',
  body: 'You got a 5 in Algebra',
  category: 'update|alert|reminder|system|security',
  relatedType: 'grade|schedule|achievement',
  relatedId: 123,
  isRead: false,
  createdAt: '2024-01-25T15:30:00Z'
}
```

### Sending Notifications

```python
from services.websocket_service import send_notification

# Отправить одному пользователю
send_notification(user_id=5, notification_dict={
    'title': 'New Grade',
    'body': 'You got a 5',
    'category': 'update'
})

# или через DB (будет доставлено при следующем подключении)
from models import Notification, db

notif = Notification(
    user_id=5,
    title='...',
    body='...',
    category='update'
)
db.session.add(notif)
db.session.commit()
```

---

## 🐳 Docker

```bash
# Build
docker build -t aqbobek-backend .

# Run
docker run -p 5000:5000 \
  -e FLASK_ENV=production \
  -e DATABASE_URL=postgresql://... \
  -e GROQ_API_KEY=... \
  aqbobek-backend
```

---

## 📋 Testing API

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "student1@school.com",
    "password": "student123"
  }'

# Save token
TOKEN=$(jq -r '.access_token' response.json)

# Get grades
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/student/grades

# Get leaderboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/student/leaderboard

# Get schedule
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/student/schedule

# Get analytics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/student/analytics
```

---

## 🛠️ Development

### Logs

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Message")
logger.error("Error")
logger.warning("Warning")
```

### DB Queries

```python
from models import User, Grade

# All students
User.query.filter_by(role='student').all()

# By class
User.query.filter_by(class_name='10A', role='student').all()

# Grades for student
Grade.query.filter_by(student_id=5).order_by(Grade.date.desc()).all()
```

### Debug Mode

```bash
FLASK_DEBUG=1 python app.py
```

---

## 🚀 Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Change all `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set strong JWT secrets
- [ ] Enable rate limiting
- [ ] Set up logging to file
- [ ] Use gunicorn with multiple workers
- [ ] Set up monitoring/alerts
- [ ] Backup database regularly

---

**Made with ❤️ for Aqbobek Lyceum**
