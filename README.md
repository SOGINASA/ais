# 🏫 Aqbobek Lyceum - School Management System

A comprehensive educational management platform built with **Flask** (backend) and **React** (frontend), featuring student analytics, AI-powered insights, schedule generation, and real-time notifications.

**Status**: ✅ Production-ready MVP  
**Docker**: Fully containerized with development & production profiles  
**License**: MIT

---

## 🎯 Quick Start (Docker Recommended)

```bash
# 1. Navigate to backend
cd backend

# 2. Configure environment
cp .env.example .env

# 3. Start everything (one command!)
docker-compose up --build

# 4. Open in browser
open http://localhost:3000
```

**Duration**: ~5 minutes (includes build time on first run)

👉 See [QUICKSTART.md](./QUICKSTART.md) for alternatives and detailed setup.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get running in 5 minutes |
| [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) | Docker setup, commands, troubleshooting |
| [backend/BACKEND_SETUP.md](./backend/BACKEND_SETUP.md) | Flask setup, database, API reference |
| [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) | Complete API endpoint reference |
| [frontend/ARCHITECTURE.md](./frontend/ARCHITECTURE.md) | Frontend component structure |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Aqbobek Lyceum                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐          ┌────────────────────┐  │
│  │   Frontend (React)   │          │  Backend (Flask)   │  │
│  │  ├─ Student Pages    │◄─────────┤  ├─ User Auth      │  │
│  │  ├─ Teacher Pages    │          │  ├─ Analytics      │  │
│  │  ├─ Admin Pages      │          │  ├─ AI Analysis    │  │
│  │  └─ Real-time Notify │          │  ├─ Scheduling     │  │
│  │                      │          │  └─ WebSocket      │  │
│  │   Port: 3000         │          │   Port: 5000       │  │
│  └──────────────────────┘          └────┬───────────────┘  │
│                                          │                   │
│                                    ┌─────▼──────────┐       │
│                                    │  SQLite / PG   │       │
│                                    │   Database     │       │
│                                    └────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

### Backend
- **Framework**: Flask 3.1 + Gunicorn
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT with role-based access control
- **Real-time**: WebSocket (Flask-Sock)
- **AI**: Groq API (mixtral-8x7b) with intelligent mock fallback
- **Scheduling**: APScheduler + custom algorithm
- **ORM**: SQLAlchemy 2.0

### Frontend
- **Framework**: React 18
- **State**: Zustand stores
- **HTTP**: Axios + custom hooks
- **Styling**: Tailwind CSS
- **UI**: Responsive, dark mode support

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Multiple profiles**: Development, Production, Testing

---

## 🎓 Features

### For Students
- 📊 **Dashboard**: Grades, schedule, achievements
- 📈 **Analytics**: Performance trends, risk detection
- 🏆 **Leaderboard**: Class rankings with points
- 🎁 **Portfolio**: Achievements and certificates
- 📅 **Schedule**: Personal timetable, conflict-free
- 🔔 **Notifications**: Real-time updates via WebSocket

### For Teachers
- 👥 **Class Management**: View students, grades, attendance
- 📝 **Grading**: Assign grades by subject, quarter
- 🎯 **Risk Detection**: Identify struggling students automatically
- 📊 **Analytics**: Class-wide performance metrics
- 🤖 **AI Reports**: Groq-powered analysis of student performance
- 📅 **Schedule**: Manage teaching assignments

### For Admins
- 🏫 **User Management**: Create/manage users by role
- 📝 **Schedule Generation**: Conflict-free timetables in seconds
- ⚙️ **System Config**: Application settings and policies
- 📊 **Reports**: System-wide analytics and insights
- 🔐 **Security**: Role-based access control, API rate limiting

---

## 📦 API Overview

**35+ RESTful endpoints** across 6 modules:

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| **Auth** | 4 | Login, logout, token refresh, health check |
| **Student** | 8 | Grades, schedule, leaderboard, portfolio, analytics |
| **Teacher** | 7 | Class management, grading, risk detection, reports |
| **AI** | 4 | Student/class analysis, predictions, subject deep-dive |
| **Schedule** | 6 | View/generate/manage timetables |
| **Admin** | 6 | Base functionality (role-based restrictions) |

👉 [Full API Reference](./backend/API_DOCUMENTATION.md)

---

## 🗄️ Database Schema

**9 Models**:
- `User` (student, teacher, parent, admin)
- `Subject` (courses offered)
- `Grade` (weighted scores with quarters)
- `ClassModel` (school classes 9A, 9B, etc)
- `Schedule` (timetable entries)
- `Achievement` (points-based badges)
- `Attendance` (daily records)
- `AnalyticsSnapshot` (cached metrics)
- `Notification` (real-time events)

**Relationships**: 30+ foreign keys with cascade deletes

👉 [Schema Details](./backend/models.py)

---

## 🚀 Deployment

### Local Development
```bash
docker-compose -f docker-compose.dev.yml up
# Hot reload enabled for both backend & frontend
```

### Production (with PostgreSQL)
```bash
cd backend
docker-compose -f docker-compose.prod.yml up -d
# Uses environment variables, health checks, logging
```

### Cloud Deployment
1. Build and push images to Docker Hub/GCR
2. Deploy with Kubernetes or Docker Swarm
3. Use environment variables for secrets (never commit .env)
4. Configure PostgreSQL, Redis for scaling

👉 [Docker Guide](./DOCKER-COMPOSE.md#production-deployment)

---

## 🧟 Demo Data

Auto-seeded on first run:
- **9 Classes**: 3A, 3B, 3C for grades 9, 10, 11
- **72+ Students**: With realistic grades and achievements
- **5 Teachers**: With assigned classes and schedules
- **1600+ Grades**: Distribution across subjects and quarters
- **2160+ Attendance Records**: Complete month-long history
- **100+ Achievements**: Points-based badges

**Test Accounts**:
```
Admin:    admin@school.com / admin123
Teacher:  teacher1@school.com / teacher123
Student:  student1@school.com / student123
```

👉 [Seed Data Guide](./backend/BACKEND_SETUP.md#seeding-demo-data)

---

## 🤖 AI Integration

### Groq API (Production)
- **Model**: mixtral-8x7b-32768 (free tier, 5K RPM)
- **Features**: Student analysis, class reports, predictions
- **Integration**: Automatic fallback to intelligent mock if API unavailable

### Mock Mode (Development)
- Simulates Groq responses based on actual student metrics
- Allows testing without API calls or keys
- Perfect for frontend development

**Smart Integration**:
```
1. Calculate 7 metrics (average score, trend, risk, etc)
2. Send metrics to Groq API (or use mock if unavailable)
3. Parse LLM response into structured format
4. Return {summary, strengths[], weaknesses[], recommendations[]}
```

---

## 🔄 Real-time Features

### WebSocket Notifications
- Student grade updates
- Schedule changes
- Achievement unlocks
- Teacher assignments
- Admin alerts

**Example**:
```javascript
// Frontend auto-subscribes
useNotifications((notification) => {
  // Handle real-time update
})

// Backend sends
send_notification({
  user_id: "student1",
  type: "grade",
  message: "New grade posted in Math"
})
```

---

## 📊 Analytics Engine

### Student Metrics
- **Average Score**: Weighted by assessment type
- **Trend**: % change over 2-week periods
- **Risk Level**: 0-100 scale (Normal/Warning/Critical)
- **By Subject**: Deep dive into individual courses
- **Attendance**: Percentage and status tracking
- **Achievements**: Points and badges earned
- **Timestamp**: When metrics were calculated

### Class Metrics
- **Class Average**: Aggregated from students
- **Top Performers**: Students above 3.5 GPA
- **At Risk**: Students below 2.0 GPA
- **Attendance Rate**: Class-wide average
- **Engagement**: Achievement distribution

---

## 🔐 Security

### Authentication
- JWT with 15-minute expiration
- Refresh tokens for session continuation
- Role-based access control (RBAC)
- Secure password hashing (Werkzeug)

### Authorization
- Role checks on all protected endpoints
- Resource ownership validation (teacher can only view own classes)
- Rate limiting on public endpoints
- CORS configuration per environment

### Data Protection
- Secrets stored in `.env` (never in git)
- Database encryption support
- HTTPS/TLS in production
- Input validation on all endpoints

---

## 🧪 Testing

### Backend
```bash
# Run all tests
docker-compose exec backend pytest

# With coverage
pytest --cov=.

# Specific module
pytest tests/test_analytics.py
```

### Frontend
```bash
docker-compose exec frontend npm test

# With coverage
npm test -- --coverage
```

---

## 📈 Performance

### Backend Optimization
- **Caching**: Analytics calculated once per hour
- **Indexing**: Database indexes on frequently queried fields
- **Gunicorn**: 4 workers, 10 threads each (configurable)
- **Connection Pool**: SQLAlchemy connection pooling

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Minification**: Production build minifies all files
- **Image Optimization**: Serve optimized images
- **Caching**: Service workers cache static assets

### Database
- **Query Optimization**: Selective field loading
- **Batch Operations**: Insert multiple records at once
- **Connection Reuse**: SQLAlchemy pooling
- **Indexing**: Primary keys + composite indexes

---

## 🛠️ Development

### Prerequisites
- Docker & Docker Compose 2.0+
- Python 3.11+ (if running without Docker)
- Node 18+ (if running without Docker)

### Setup
```bash
# Clone and navigate
cd backend

# Create environment file
cp .env.example .env

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

### Making Changes
- **Backend**: Edit files in `backend/` → auto-reloads
- **Frontend**: Edit files in `frontend/src/` → auto-reloads
- **Database**: Use `docker-compose exec backend sqlite3` to inspect
- **Logs**: `docker-compose logs -f [service_name]`

### Code Style
```bash
# Backend formatting
docker-compose exec backend black .
docker-compose exec backend isort .

# Backend linting
docker-compose exec backend flake8 .
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `docker-compose down` or kill process |
| Frontend can't reach backend | Wait 30s for backend healthcheck, verify CORS |
| Database locked | `docker-compose down -v` to reset |
| Out of memory | Reduce container resources or use PostgreSQL |
| API returning 500 | Check `docker-compose logs backend` |

👉 [Full Troubleshooting Guide](./DOCKER-COMPOSE.md#troubleshooting)

---

## 📞 Support

- **Issue Tracker**: GitHub Issues
- **Documentation**: See `/docs` folder
- **API Reference**: [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
- **Setup Help**: [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) for details.

---

## 🎉 Credits

Built for **Aqbobek Lyceum** school management system.

**Tech Stack Credits**:
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [React](https://react.dev/) - Frontend framework
- [Groq](https://www.groq.com/) - AI inference
- [Docker](https://www.docker.com/) - Containerization

---

## 🚀 Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio)
- [ ] Email integration (SMTP)
- [ ] Advanced reporting (PDF export)
- [ ] Parent portal
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Offline mode
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations (Google Classroom, etc.)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: ✅ Active Development
