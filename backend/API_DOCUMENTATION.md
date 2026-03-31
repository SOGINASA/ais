# Aqbobek Lyceum School Portal - Backend API Documentation

## 🚀 API Overview

Backend API для школьного портала. Использует Flask + SQLAlchemy + WebSocket для real-time уведомлений.

## 📋 Table of Contents

1. [Installation](#installation)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Examples](#examples)
6. [WebSocket Events](#websocket-events)

---

## Installation

```bash
# Установка зависимостей
pip install -r requirements.txt

# Инициализация БД
flask db upgrade

# Запуск сервера
python -m app

# Или с gunicorn
gunicorn -w 4 -b 0.0.0.0:5252 "app:create_app()"
```

## Требуемые переменные окружения

```bash
# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=86400  # 24 часов в секундах

# Groq API (опционально)
GROQ_API_KEY=your-groq-api-key

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Другие
SECRET_KEY=your-app-secret
DATABASE_URL=sqlite:///database.db  # или PostgreSQL
```

---

## Authentication

Все защищенные endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <access_token>
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "student@school.com",  # или username
  "password": "password123"
}

Response:
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "email": "student@school.com",
    "full_name": "Айман Нурсултан",
    "role": "student",
    "class_name": "10A"
  }
}
```

---

## API Endpoints

### 👨‍🎓 Student API (`/api/student/`)

#### GET `/api/student/grades`
Получить оценки студента

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/grades?subject_id=1&weeks=4"

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 5,
      "subjectId": 1,
      "subject": "Алгебра",
      "score": 5,
      "type": "lesson",
      "weight": 1.0,
      "date": "2024-01-25",
      "quarter": 1
    },
    ...
  ],
  "count": 15,
  "statistics": {
    "average": 4.3,
    "trend": 5.2  # % изменение за последние 2 недели
  }
}
```

#### GET `/api/student/leaderboard`
Рейтинг класса

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/leaderboard"

Response:
{
  "success": true,
  "data": [
    {
      "student_id": 1,
      "name": "Айнур Алибек",
      "rank": 1,
      "average": 4.8,
      "achievements": 5,
      "is_current_user": false
    },
    {
      "student_id": 5,
      "name": "Айман Нурсултан",
      "rank": 2,
      "average": 4.3,
      "achievements": 3,
      "is_current_user": true
    }
  ],
  "user_rank": 2,
  "total_students": 28
}
```

#### GET `/api/student/portfolio`
Достижения студента

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/portfolio"

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 5,
      "title": "Первый шаг",
      "description": "Получить первую оценку 5",
      "icon": "⭐",
      "type": "grades",
      "points": 10,
      "achievedAt": "2024-01-11T15:30:00Z"
    }
  ],
  "grouped": {
    "grades": [...],
    "olympiad": [...],
    "attendance": [...]
  },
  "statistics": {
    "total_achievements": 5,
    "total_points": 45
  }
}
```

#### GET `/api/student/schedule`
Расписание класса студента

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/schedule"

Response:
{
  "success": true,
  "class": "10A",
  "data": [
    {
      "id": 1,
      "classId": 1,
      "class": "10A",
      "subjectId": 1,
      "subject": "Алгебра",
      "teacherId": 101,
      "teacher": "Нургали Ермеков",
      "dayOfWeek": 0,  # Monday
      "timeSlot": 1,
      "startTime": "08:55",
      "endTime": "09:40",
      "room": "101",
      "lessonType": "lesson"
    }
  ],
  "grouped": {
    "Monday": [...],
    "Tuesday": [...],
    ...
  }
}
```

#### GET `/api/student/attendance`
Посещаемость

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/attendance?days=30"

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 5,
      "date": "2024-01-25",
      "status": "present",  # present, absent, late, excused
      "markedById": 101,
      "notes": null
    }
  ],
  "statistics": {
    "total": 25,
    "present": 23,
    "absent": 1,
    "late": 1,
    "absent_percentage": 6.0
  }
}
```

#### GET `/api/student/analytics`
Полная аналитика студента

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/student/analytics"

Response:
{
  "success": true,
  "data": {
    "student_id": 5,
    "average_score": 4.3,
    "trend": 5.2,
    "risk": {
      "risk_level": "normal",
      "reasons": [],
      "score": 0.0
    },
    "by_subject": [
      {
        "subject": "Алгебра",
        "average": 4.5,
        "grade_count": 8,
        "trend": 3.2
      }
    ],
    "attendance": { /* ... */ },
    "achievements": 5,
    "timestamp": "2024-01-25T15:30:00Z"
  }
}
```

---

### 👨‍🏫 Teacher API (`/api/teacher/`)

#### GET `/api/teacher/classes`
Классы учителя

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/teacher/classes"
```

#### GET `/api/teacher/class/{class_id}/students`
Студенты класса с аналитикой

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/teacher/class/1/students"

Response:
{
  "success": true,
  "class": {
    "id": 1,
    "name": "10A",
    "gradeLevel": 10
  },
  "data": [
    {
      "user": {
        "id": 5,
        "name": "Айман Нурсултан",
        "email": "aiman@school.com"
      },
      "analytics": { /* full analytics */ }
    }
  ],
  "count": 28
}
```

#### GET `/api/teacher/risk-students`
Студенты в риске

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/teacher/risk-students"

Response:
{
  "success": true,
  "data": [
    {
      "student_id": 3,
      "name": "Берик Оспанов",
      "class": "10A",
      "risk_level": "critical",
      "risk_score": 75.0,
      "reasons": [
        "Низкий средний балл: 2.3",
        "Резкое падение оценок -25%",
        "Много пропусков: 32%"
      ],
      "average": 2.3
    }
  ],
  "critical_count": 2,
  "warning_count": 5
}
```

#### POST `/api/teacher/grade`
Добавить оценку

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 5,
    "subject_id": 1,
    "score": 5,
    "type": "lesson",
    "weight": 1.0,
    "quarter": 1,
    "description": "Good performance"
  }' \
  "http://localhost:5252/api/teacher/grade"
```

#### POST `/api/teacher/mark-attendance`
Отметить посещаемость

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "student_id": 1,
        "status": "present"
      },
      {
        "student_id": 2,
        "status": "absent",
        "notes": "Sick"
      }
    ]
  }' \
  "http://localhost:5252/api/teacher/mark-attendance"
```

#### POST `/api/teacher/report/{student_id}`
AI отчет по студенту

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/teacher/report/5"

Response:
{
  "success": true,
  "student": {
    "id": 5,
    "name": "Айман Нурсултан"
  },
  "report": {
    "summary": "Айман shows good academic performance with an average of 4.3/5. Performance is improving (5.2%). Keep up the good work.",
    "strengths": [
      "Strong academic foundation",
      "Clear upward trend in recent work",
      "Good in Алгебра"
    ],
    "weaknesses": [
      "Needs improvement in English"
    ],
    "recommendations": [
      "Monitor performance closely",
      "Focus on weaker subjects",
      "Attend after-school support sessions"
    ]
  }
}
```

---

### 🤖 AI API (`/api/ai/`)

#### GET `/api/ai/student-report/{student_id}`
Подробный отчет с аналитикой

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/ai/student-report/5"

Response:
{
  "success": true,
  "student": {
    "id": 5,
    "name": "Айман Нурсултан",
    "class": "10A"
  },
  "analytics": { /* full analytics */ },
  "ai_report": { /* AI analysis */ }
}
```

#### GET `/api/ai/class-report/{class_id}`
Отчет по классу

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/ai/class-report/1"

Response:
{
  "success": true,
  "class": { "id": 1, "name": "10A" },
  "analytics": {
    "total_students": 28,
    "average_score": 4.1,
    "students_at_risk": 3,
    "top_performers": [
      { "student_id": 1, "name": "Айнур Алибек", "average": 4.8 }
    ],
    "at_risk": [
      { "student_id": 3, "name": "Берик Оспанов", "risk_level": "critical" }
    ]
  },
  "ai_report": {
    "summary": "Class 10A shows overall good academic performance...",
    "recommendations": [...]
  }
}
```

#### GET `/api/ai/predictions/{student_id}`
Предсказания

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/ai/predictions/5"

Response:
{
  "success": true,
  "student_id": 5,
  "data": {
    "future_trend": "improving",
    "confidence": 0.45,
    "prediction": "Student is showing strong improvement. Expected to continue improving.",
    "recommended_actions": [
      "Maintain current approach",
      "Consider leadership roles"
    ]
  }
}
```

---

### 📅 Schedule API (`/api/schedule/`)

#### GET `/api/schedule/class/{class_id}`
Расписание класса

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/schedule/class/1"
```

#### GET `/api/schedule/teacher/{teacher_id}`
Расписание учителя

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/schedule/teacher/101"
```

#### POST `/api/schedule/generate`
Генерировать расписание (ADMIN only)

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clear_existing": false}' \
  "http://localhost:5252/api/schedule/generate"

Response:
{
  "success": true,
  "message": "Generated 245 schedule entries",
  "data": {
    "schedules_created": 245,
    "conflicts": []
  }
}
```

#### POST `/api/schedule/recalculate`
Проверить конфликты

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  "http://localhost:5252/api/schedule/recalculate"

Response:
{
  "success": true,
  "message": "No conflicts found",
  "data": {
    "conflict_count": 0,
    "conflicts": []
  }
}
```

---

## Data Models

### User
```python
{
  "id": 1,
  "email": "user@school.com",
  "full_name": "Full Name",
  "role": "student|teacher|parent|admin",
  "class_name": "10A",  # для студентов
  "phone": "+7 777 123 4567",
  "birthday": "2008-01-15",
  "avatar_url": "https://...",
  "is_active": true,
  "created_at": "2023-09-01T00:00:00Z"
}
```

### Grade
```python
{
  "id": 1,
  "studentId": 5,
  "subjectId": 1,
  "subject": "Алгебра",
  "teacherId": 101,
  "score": 5,  # 1-5
  "type": "lesson|lab|quiz|test|exam",
  "weight": 1.0,
  "date": "2024-01-25",
  "quarter": 1,
  "description": "..."
}
```

### Schedule
```python
{
  "id": 1,
  "classId": 1,
  "class": "10A",
  "subjectId": 1,
  "subject": "Алгебра",
  "teacherId": 101,
  "teacher": "Нургали Ермеков",
  "dayOfWeek": 0,  # 0=Monday, 4=Friday
  "timeSlot": 1,   # 1-7 урок
  "startTime": "08:55",
  "endTime": "09:40",
  "room": "101",
  "lessonType": "lesson|lab|workshop"
}
```

### Achievement
```python
{
  "id": 1,
  "studentId": 5,
  "title": "First Step",
  "description": "Got first grade 5",
  "icon": "⭐",
  "type": "grades|olympiad|attendance|test",
  "points": 10,
  "achievedAt": "2024-01-11T15:30:00Z"
}
```

---

## Examples

### Create Demo Data

```python
from app import create_app, db
from models import User, Subject, Grade, ClassModel, Schedule
from datetime import datetime, timezone

app = create_app()

with app.app_context():
    # Создаем предметы
    math = Subject(name="Алгебра", code="MATH")
    english = Subject(name="English", code="ENG")
    
    # Создаем класс
    cls = ClassModel(name="10A", grade_level=10)
    
    # Создаем студента
    student = User(
        email="student1@school.com",
        full_name="Айман Нурсултан",
        role="student",
        class_name="10A"
    )
    student.set_password("password123")
    
    # Создаем учителя
    teacher = User(
        email="teacher1@school.com",
        full_name="Нургали Ермеков",
        role="teacher"
    )
    teacher.set_password("password123")
    
    db.session.add_all([math, english, cls, student, teacher])
    db.session.commit()
    
    # Добавляем оценки
    grade = Grade(
        student_id=student.id,
        subject_id=math.id,
        teacher_id=teacher.id,
        score=5,
        type="lesson",
        date=datetime.now(timezone.utc).date()
    )
    db.session.add(grade)
    db.session.commit()
```

---

## WebSocket Events

### Subscribe to Notifications

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:5252/ws/notifications?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'notification') {
    console.log('New notification:', data.payload);
  } else if (data.type === 'unread_count') {
    console.log('Unread:', data.payload.count);
  } else if (data.type === 'ping') {
    ws.send(JSON.stringify({ type: 'pong' }));
  }
};
```

### Notification Payload

```javascript
{
  type: 'notification',
  payload: {
    id: 1,
    title: 'Grade Added',
    body: 'You got a 5 in Algebra',
    category: 'update',
    relatedType: 'grade',
    relatedId: 123,
    isRead: false,
    createdAt: '2024-01-25T15:30:00Z'
  }
}
```

---

## Error Handling

```json
{
  "error": "Student not found",
  "code": "NOT_FOUND"
}
```

Common error codes:
- `NOT_FOUND` (404)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `BAD_REQUEST` (400)
- `INTERNAL_ERROR` (500)

---

## Testing

```bash
# Экспортируем Postman коллекцию
# API docs: http://localhost:5252/docs

# Или используем curl
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5252/api/student/grades
```

---

## Performance Tips

1. **Кеширование**: Используйте Redis для кеша аналитики
2. **Индексы БД**: Все FK и часто используемые колонки должны быть индексированы
3. **Пагинация**: Для больших списков используйте `?limit=20&offset=0`
4. **WebSocket**: Используйте для real-time обновлений, а не polling

---

## Deployment

### Docker

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5252", "app:create_app()"]
```

### Environment Variables

```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@localhost/aqbobek
GROQ_API_KEY=gsk_...
JWT_SECRET_KEY=long-random-secret
```

---

## License

MIT
