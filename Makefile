.PHONY: help build up down restart logs seed clean dev prod

# Default target
help:
	@echo "Aqbobek Lyceum - Docker Commands"
	@echo "=================================="
	@echo ""
	@echo "Development & Testing:"
	@echo "  make dev           - Start development environment with hot reload"
	@echo "  make build         - Build Docker images"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - View service logs"
	@echo ""
	@echo "Database & Data:"
	@echo "  make seed          - Seed demo data into database"
	@echo "  make db-reset      - Reset database (WARNING: deletes data)"
	@echo "  make db-shell      - Open SQLite shell"
	@echo ""
	@echo "Production:"
	@echo "  make prod          - Start production environment (with PostgreSQL)"
	@echo "  make prod-down     - Stop production environment"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         - Remove containers, volumes, images"
	@echo "  make ps            - Show running containers"
	@echo "  make backend-sh    - Open shell in backend container"
	@echo "  make frontend-sh   - Open shell in frontend container"
	@echo ""

# Development environment
dev:
	docker-compose -f docker-compose.dev.yml up

# Standard environment
build:
	docker-compose build

up:
	docker-compose up -d && docker-compose logs -f

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f --tail=50

# Database commands
seed:
	docker-compose exec backend python seed.py

db-reset:
	@echo "WARNING: This will delete all database data!"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v && docker-compose up -d; \
	fi

db-shell:
	docker-compose exec backend sqlite3 /app/database/aqbobek.db

# Production environment
prod:
	docker-compose -f docker-compose.prod.yml up -d && docker-compose -f docker-compose.prod.yml logs -f

prod-down:
	docker-compose -f docker-compose.prod.yml down

# Utilities
clean:
	docker-compose down -v --rmi all
	docker image prune -f
	docker volume prune -f

ps:
	docker-compose ps

backend-sh:
	docker-compose exec backend /bin/sh

frontend-sh:
	docker-compose exec frontend /bin/sh

# Testing
test:
	docker-compose exec backend pytest

# Backend migrations (if using flask-migrate)
migrate:
	docker-compose exec backend flask db upgrade

# View specific service logs
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Rebuild and start
rebuild:
	docker-compose down && docker-compose up --build -d && docker-compose logs -f

# Format code (if configured)
format:
	docker-compose exec backend black .
	docker-compose exec backend isort .

# Run linter
lint:
	docker-compose exec backend flake8 .

# View environment
env:
	@grep -v '^#' backend/.env | grep -v '^$$'

# Health check
health:
	@echo "Backend health:"
	@docker-compose exec backend curl -f http://localhost:5252/api/auth/health || echo "Unhealthy"
	@echo ""
	@echo "Frontend health:"
	@curl -f http://localhost:3000 > /dev/null && echo "Healthy" || echo "Unhealthy"
