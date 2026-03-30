# Docker & Docker Compose Setup Guide

This guide describes how to run the entire Aqbobek Lyceum application (backend + frontend) using Docker and Docker Compose.

## 📋 Prerequisites

- Docker 20.10+ installed
- Docker Compose 1.29+ installed
- 2GB+ available disk space
- Ports 3000 and 5000 available on your machine

## 🚀 Quick Start

### 1. Navigate to the root directory
```bash
cd /path/to/aqbobek
# или просто текущая директория, если вы уже там
```

### 2. Create `.env` file in backend folder
```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your configuration:
```env
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
GROQ_API_KEY=your-groq-api-key-here

# Optional: For PostgreSQL (currently using SQLite)
DATABASE_URL=sqlite:////app/database/aqbobek.db
```

### 3. Build and start both containers
```bash
docker-compose up --build
```

This will:
- Build the backend Flask image (python:3.11-slim)
- Build the frontend React image (node:18-alpine)
- Start both services with proper networking
- Initialize the database automatically

### 4. Access the application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/auth/health

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                 │
│       (aqbobek_network)                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐  ┌─────────────┐ │
│  │  Frontend        │  │   Backend   │ │
│  │  (port 3000)     │  │ (port 5000) │ │
│  │                  │  │             │ │
│  │  node:18-alpine  │  │ python:3.11 │ │
│  │  - React app     │  │ - Flask API │ │
│  │  - npm build     │  │ - SQLite    │ │
│  │  - serve         │  │ - APScheduler│
│  └──────────────────┘  └─────────────┘ │
│         │                     │         │
│         └─────────────────────┘         │
│     Inter-container communication       │
│     (frontend → backend:5000)           │
│                                         │
└─────────────────────────────────────────┘

Volumes:
- backend/database/ → /app/database (SQLite persistence)
- backend/logs/ → /app/logs (Application logs)
```

## 📦 Service Details

### Backend Service
- **Image:** Custom Python 3.11-slim
- **Port:** 5000
- **Container Name:** aqbobek_backend
- **Volumes:** 
  - `./database:/app/database` (persistent SQLite)
  - `./logs:/app/logs` (persistent logs)
- **Health Check:** curl http://localhost:5000/api/auth/health every 30s
- **Dependencies:** None (frontend depends on backend)

### Frontend Service
- **Image:** Custom Node 18-alpine with build
- **Port:** 3000
- **Container Name:** aqbobek_frontend
- **Environment:**
  - `REACT_APP_API_BASE=http://backend:5000` (internal Docker DNS)
  - `REACT_APP_USE_MOCK=false` (disable mock API)
- **Health Check:** wget http://localhost:3000 every 30s
- **Dependencies:** Waits for backend service healthcheck

## 🛠️ Common Commands

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services
```bash
docker-compose down
```

### Remove volumes (⚠️ deletes database)
```bash
docker-compose down -v
```

### Restart a service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Execute command in running container
```bash
# In backend
docker-compose exec backend python seed.py

# In frontend
docker-compose exec frontend npm test
```

## 🔧 Development Workflow

### With Hot Reload (Backend)

For Flask hot reload during development:

1. Modify `backend/Dockerfile.dev`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]
```

2. Create `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app  # Mount entire directory for hot reload
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
    # ... rest of config

  frontend:
    # ... same as production
```

3. Start development environment:
```bash
docker-compose -f docker-compose.dev.yml up
```

### With Hot Reload (Frontend)

Frontend already supports hot reload with `npm start` in development. Modify `frontend/Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json .
RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"]
```

Note: In development, you'll need to:
1. Keep volume mounted for source code
2. Use `npm start` instead of `serve`
3. Ensure NODE_ENV is set appropriately

## 🗄️ Database

### SQLite (Current)
- **Location:** `backend/database/aqbobek.db`
- **Persistence:** Via Docker volume `./database:/app/database`
- **Initialization:** Automatic on first run via `seed.py`

### Access database
```bash
# Through container
docker-compose exec backend sqlite3 /app/database/aqbobek.db

# Through host (if sqlite3 installed)
sqlite3 ./backend/database/aqbobek.db
```

### Seed demo data
```bash
docker-compose exec backend python seed.py
```

### Reset database
```bash
# Remove and recreate
docker-compose down -v
docker-compose up --build
```

## 🔐 Environment Variables

Edit `backend/.env`:

```env
# Flask
FLASK_ENV=production
FLASK_APP=app.py

# Security
SECRET_KEY=change-this-to-a-random-string
JWT_SECRET_KEY=change-this-to-a-random-string
CORS_ORIGINS=http://localhost:3000,http://0.0.0.0:3000

# Database
DATABASE_URL=sqlite:////app/database/aqbobek.db

# AI Integration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768

# Logging
LOG_LEVEL=INFO

# Optional: Telegram bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Backend refusing connections
```bash
# Check backend logs
docker-compose logs backend

# Verify health
docker-compose exec backend curl http://localhost:5000/api/auth/health

# Restart service
docker-compose restart backend
```

### Frontend shows "Cannot reach backend"
1. Check `REACT_APP_API_BASE` is set to `http://backend:5000`
2. Verify backend is healthy with `docker-compose ls`
3. Check network: `docker network ls`
4. Verify DNS: `docker-compose exec frontend ping backend`

### Database locked/corrupted
```bash
# Backup current database
cp backend/database/aqbobek.db backend/database/aqbobek.db.backup

# Remove and recreate
docker-compose down -v
docker-compose up --build
```

### Memory/performance issues
```yaml
# In docker-compose.yml, limit resources:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 📈 Production Deployment

### Using Docker Hub
```bash
# Build and tag
docker build -t your-username/aqbobek-backend:1.0 backend/
docker build -t your-username/aqbobek-frontend:1.0 frontend/

# Push
docker push your-username/aqbobek-backend:1.0
docker push your-username/aqbobek-frontend:1.0

# Pull on production server
docker pull your-username/aqbobek-backend:1.0
docker pull your-username/aqbobek-frontend:1.0
```

### Production environment
```env
FLASK_ENV=production
SECRET_KEY=<generate-with-secrets.token_hex(32)>
JWT_SECRET_KEY=<generate-with-secrets.token_hex(32)>
DATABASE_URL=postgresql://user:password@postgres:5432/aqbobek
GROQ_API_KEY=<your-production-key>
```

### With PostgreSQL
Add to `docker-compose.yml`:
```yaml
postgres:
  image: postgres:15-alpine
  container_name: aqbobek_postgres
  environment:
    POSTGRES_DB: aqbobek
    POSTGRES_USER: aqbobek
    POSTGRES_PASSWORD: secure-password
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - aqbobek_network

volumes:
  postgres_data:
```

Then use:
```env
DATABASE_URL=postgresql://aqbobek:secure-password@postgres:5432/aqbobek
```

## 🔗 Network Communication

Inside Docker containers, services communicate via container names:

```javascript
// From frontend to backend (inside Docker)
const response = await fetch('http://backend:5000/api/student/grades');

// From host to containers
const response = await fetch('http://localhost:5000/api/student/grades');
```

## 📊 Health Checks

Both services include health checks:

```bash
# Check status
docker-compose ps

# Manual health check
curl -f http://localhost:5000/api/auth/health  # Backend
curl -f http://localhost:3000                   # Frontend
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove volumes
docker volume prune

# Nuclear option (removes everything related to this compose)
docker-compose down -v --rmi all
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Flask Deployment with Gunicorn](https://flask.palletsprojects.com/en/2.3.x/deploying/gunicorn/)
- [React Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## ✅ Verification Checklist

After running `docker-compose up --build`:

- [ ] Backend service running on port 5000
- [ ] Frontend service running on port 3000
- [ ] Both services show "healthy" in `docker-compose ps`
- [ ] Can access `http://localhost:3000` in browser
- [ ] Can access `http://localhost:5000/api/auth/health`
- [ ] Frontend API calls show `REACT_APP_USE_MOCK=false` in console
- [ ] Database file exists at `backend/database/aqbobek.db`
- [ ] No CORS errors in browser console

---

**Last Updated:** 2024
**Tested On:** Docker 24.x, Docker Compose 2.x
