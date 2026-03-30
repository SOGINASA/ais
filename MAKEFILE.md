# 📋 Make Commands Reference

Quick reference for all available Make commands. Requires `make` to be installed.

## 🚀 Installation

### macOS / Linux
```bash
# Usually pre-installed
which make

# If not installed
sudo apt-get install make  # Ubuntu/Debian
brew install make          # macOS (if using Homebrew)
```

### Windows
```powershell
# Option 1: Using Chocolatey
choco install make

# Option 2: Using WSL (Windows Subsystem for Linux)
# Run from WSL terminal - same as Linux
```

---

## 📖 Quick Reference

### Getting Help
```bash
make help
# Shows all available commands
```

---

## 🎯 Main Commands

### Development Environment
```bash
make dev
# Start with hot reload for backend & frontend
# Watches file changes and auto-reloads
```

### Production Environment
```bash
make prod
# Start with PostgreSQL database
# Full production setup

make prod-down
# Stop production environment
```

### Standard Development
```bash
make build
# Build Docker images

make up
# Start all services in background and show logs

make down
# Stop all services

make restart
# Restart all running services

make logs
# View real-time logs from all services
```

---

## 🗄️ Database Commands

### Seed Demo Data
```bash
make seed
# Create 72+ students, teachers, grades, schedules
# Takes ~10 seconds
# Re-run to reset data
```

### Reset Database
```bash
make db-reset
# ⚠️  WARNING: Deletes all data
# Removes volumes and starts fresh
# Prompts for confirmation
```

### Database Shell
```bash
make db-shell
# Open SQLite interactive shell
# Type .tables to see all tables
# Type .exit to quit
```

---

## 📊 Utility Commands

### View Service Status
```bash
make ps
# Shows which containers are running/stopped
# Equivalent to: docker-compose ps
```

### Open Container Shells
```bash
make backend-sh
# Interactive shell inside backend container
# Run Python commands, inspect files, etc.

make frontend-sh
# Interactive shell inside frontend container
# Run npm commands, debug, etc.
```

### View Environment
```bash
make env
# Show current .env variables (non-secrets)
# Useful for verifying configuration
```

### Health Check
```bash
make health
# Check if both backend and frontend are responding
# Shows "Healthy" or "Unhealthy" status
```

---

## 🧪 Testing Commands

### Run Tests
```bash
make test
# Run all backend tests (pytest)
```

### Code Formatting
```bash
make format
# Auto-format Python code (black, isort)
```

### Linting
```bash
make lint
# Check code style with flake8
```

---

## 📝 Logging Commands

### All Services
```bash
make logs
# Show last 50 lines from all services
# Use Ctrl+C to stop following
```

### Specific Service
```bash
make logs-backend
# Show only backend logs

make logs-frontend
# Show only frontend logs
```

---

## 🔄 Advanced Commands

### Full Rebuild
```bash
make rebuild
# Stop everything, rebuild images, start fresh
# Useful when Dockerfile changes
```

### Clean Everything
```bash
make clean
# Remove all containers, volumes, images
# ⚠️  WARNING: Deletes all data
# Frees up disk space
```

---

## 💡 Usage Examples

### Fresh Start
```bash
make clean
make build
make up

# Wait 30 seconds, then:
make seed
```

### Development with Hot Reload
```bash
make dev
# Edit any file, changes auto-apply
# Logs show in real-time
# Press Ctrl+C to stop
```

### Quick Test After Changes
```bash
make logs-backend  # In terminal 1
# Let it run in background

make rebuild       # In terminal 2
# Rebuilds everything
```

### Check What's Wrong
```bash
make ps
make logs
make health

# If database corrupted:
make db-reset
make seed
```

---

## 🛠️ Troubleshooting

### Command Not Found
```bash
# Make sure you're in the correct directory (root of project)
pwd  # Should show: .../ais

# Check make is installed
which make

# If make not installed, install it (see Installation section)
```

### Permission Denied
```bash
# On some systems, may need sudo
sudo make build

# Better: Fix permissions
sudo chown -R $USER:$USER .
make build
```

### Makefile Not Found
```bash
# Make sure Makefile exists in project root
ls Makefile

# If not, download it from documentation or create manually
```

---

## 🚀 Cheat Sheet

```bash
# Start (development)
make dev

# Start (production)
make prod

# View logs
make logs

# Seed data
make seed

# Reset everything
make clean && make rebuild && make seed

# Quick health check
make health

# Check status
make ps

# Stop everything
make down
```

---

## 📚 Equivalent Docker Commands

| Make Command | Docker Equivalent |
|--------------|-------------------|
| `make up` | `docker-compose up -d && docker-compose logs -f` |
| `make down` | `docker-compose down` |
| `make restart` | `docker-compose restart` |
| `make logs` | `docker-compose logs -f --tail=50` |
| `make ps` | `docker-compose ps` |
| `make backend-sh` | `docker-compose exec backend /bin/sh` |
| `make seed` | `docker-compose exec backend python seed.py` |
| `make clean` | `docker-compose down -v --rmi all` |

---

## ⚙️ Customizing Makefile

Edit `Makefile` to add your own commands:

```makefile
# Example: Custom command
my-command:
	@echo "Running my custom command..."
	docker-compose exec backend python my_script.py

# Add to help section above
# Usage:
# make my-command
```

---

## 🔗 Related Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Get started in 5 minutes
- [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) - Full Docker guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: ✅ Ready to use
