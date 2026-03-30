# 🚀 Aqbobek Lyceum - Quick Start Guide

Get the entire application running in **less than 5 minutes**.

## ⚡ TL;DR (30 seconds)

```bash
# 1. Copy environment file
cp backend/.env.example backend/.env

# 2. Start everything
docker-compose up --build

# 3. Open in browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

Done! The app is running.

## 📝 First Time Setup

### Step 1: Prerequisites
- ✅ Docker installed
- ✅ Docker Compose installed
- ✅ Ports 3000 & 5000 available

### Step 2: Configuration
```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (optional - defaults work out of box):
```env
SECRET_KEY=super-secret-key-change-me
JWT_SECRET_KEY=jwt-secret-key-change-me
GROQ_API_KEY=  # Leave empty to use mock AI
```

### Step 3: Start
```bash
docker-compose up --build
```

Wait for output:
```
✔ backend service_healthy
✔ frontend is running on port 3000
```

### Step 4: Access
| Component | URL |
|-----------|-----|
| Frontend | http://localhost:3000 |
| API Health | http://localhost:5000/api/auth/health |
| Swagger Docs | http://localhost:5000/api/docs *(if available)* |

## 🔑 Test Accounts

Use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher1@school.com | teacher123 |
| Student | student1@school.com | student123 |

*Note: These are auto-created from `seed.py` on first run*

## 📊 What's Included

✅ **Backend Features**
- User authentication (JWT) with 4 roles
- Student analytics (grades, trends, risk detection)
- Teacher tools (class management, grade assignment)
- AI-powered analysis (Groq API with fallback)
- Schedule generation (conflict-free timetables)
- Real-time WebSocket notifications
- RESTful API with 35+ endpoints

✅ **Frontend Features**
- Student dashboard (grades, schedule, achievements)
- Teacher dashboard (class management, analytics)
- Admin panel (schedule generation, user management)
- Real-time notifications
- Mobile-responsive design
- Dark mode support

## 🎮 Common Tasks

### Seed Demo Data
```bash
docker-compose exec backend python seed.py
```
Creates 72+ students, 5 teachers, realistic grades and schedules.

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Database
```bash
docker-compose exec backend sqlite3 /app/database/aqbobek.db

# List tables
.tables

# View students
SELECT * FROM user WHERE role='student' LIMIT 5;

# Exit
.exit
```

### Stop Services
```bash
docker-compose down
```

### Restart Backend Only
```bash
docker-compose restart backend
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 3000 already in use` | Use `docker-compose down` or kill process on port 3000 |
| `Port 5000 already in use` | Kill process on port 5000 or change docker-compose.yml |
| `Frontend shows "Cannot reach backend"` | Wait 30s for backend to be healthy, check `docker-compose ps` |
| `Database locked` | Run `docker-compose down -v` to reset |
| `Out of memory` | Reduce container resources in docker-compose.yml |

## 📚 Next Steps

1. **Customize**: Edit `.env` for your settings
2. **Deploy**: See [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) for production setup
3. **Develop**: Check [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md) for API reference
4. **Integrate**: View [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for endpoint details

## 🆘 Need Help?

**Backend issues**: Check `backend/BACKEND_SETUP.md`
**API details**: See `backend/API_DOCUMENTATION.md`
**Docker guide**: Read `DOCKER-COMPOSE.md`
**Frontend code**: Browse `frontend/src/`

## 💡 Pro Tips

```bash
# Watch logs while running
docker-compose logs -f --tail=20

# Run command in container
docker-compose exec backend python

# Copy file from container
docker cp aqbobek_backend:/app/database.db ./backup.db

# Clean everything and start fresh
docker-compose down -v && docker-compose up --build
```

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready
