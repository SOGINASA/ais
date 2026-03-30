# 🐳 Docker Best Practices & Maintenance

Guidelines for optimal Docker usage, performance, and maintenance.

---

## 📦 Image Optimization

### Reduce Image Size

#### Backend (Python)
Current size: ~200MB

Optimization strategies:
1. **Use Alpine images**: `python:3.11-slim` instead of `python:3.11` (saves 500MB+)
2. **Multi-stage builds**: Separate build and runtime stages
3. **Minimize layers**: Combine RUN commands with &&
4. **Clean cache**: Delete unnecessary files

Example multi-stage Dockerfile:
```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim

COPY --from=builder /root/.local /root/.local
COPY . /app
WORKDIR /app

ENV PATH=/root/.local/bin:$PATH
CMD ["gunicorn", "app:create_app()"]
```

#### Frontend (Node)
Current size: ~450MB (with node_modules)

Optimization strategies:
1. **Production builds only**: Use multi-stage build
2. **Remove dev dependencies**: `npm install --production`
3. **Prune unused packages**: `npm prune`
4. **Minimize node_modules**: Use `npm ci` instead of `npm install`

Already optimized in current Dockerfile.dev:
- Uses 2-stage build (builder → production)
- Serves pre-built static files
- No node_modules in final image

### Image Size Monitoring

```bash
# Check image sizes
docker images

# Inspect layers
docker history aqbobek_backend:latest

# Analyzer tool
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive aqbobek_backend:latest
```

---

## 🧹 Container Maintenance

### Regular Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove dangling images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Complete cleanup (careful!)
docker system prune -a -f
```

### Cleanup Script

Create `scripts/docker-cleanup.sh`:
```bash
#!/bin/bash
echo "Cleaning up unused Docker resources..."
docker container prune -f
docker image prune -f
docker volume prune -f
docker network prune -f
echo "Cleanup complete!"
```

Run with `make` or cron:
```bash
# Manual
bash scripts/docker-cleanup.sh

# Automated (daily at 2 AM)
0 2 * * * /path/to/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
```

---

## 💾 Volume Management

### Named Volumes

Use named volumes for better organization:

```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - aqbobek_database:/app/database
      - aqbobek_logs:/app/logs

volumes:
  aqbobek_database:
    driver: local
  aqbobek_logs:
    driver: local
```

### Backup & Restore

```bash
# Backup database volume
docker run --rm -v aqbobek_database:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/database-backup.tar.gz -C /data .

# Restore database
docker run --rm -v aqbobek_database:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/database-backup.tar.gz -C /data

# Backup entire docker volumes
docker run --rm -ti -v /var/lib/docker/volumes:/volumes \
  -v $(pwd):/backup \
  alpine tar czf /backup/all-volumes.tar.gz -C /volumes .
```

### Monitor Volume Usage

```bash
# Check volume sizes
docker system df

# Detailed info
docker volume ls
docker inspect <volume-name>
```

---

## 🔒 Security Best Practices

### Base Image Security

```dockerfile
# ❌ Avoid
FROM python:3.11
FROM node:18
FROM ubuntu:latest

# ✅ Preferred
FROM python:3.11-slim-bookworm
FROM node:18-alpine
FROM debian:bookworm-slim
```

### Non-Root User

```dockerfile
# Don't run as root
RUN useradd -m -u 1000 appuser
USER appuser

# If root needed temporarily
RUN --security=insecure apt-get install ...
```

### Secrets Management

```bash
# ❌ WRONG - never commit secrets
ENV GROQ_API_KEY=gsk_...

# ✅ CORRECT - use Docker secrets
docker secret create groq_key -
# Then reference in compose:
# secrets:
#   - groq_key

# Or use environment variables at runtime
docker run -e GROQ_API_KEY=$GROQ_API_KEY ...
```

### Image Scanning

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image aqbobek_backend:latest

# Fix vulnerabilities
docker image build --build-arg BUILDKIT_INLINE_CACHE=1 .

# Use GitHub security scanning
# Enable in: Settings → Code security → Dependabot
```

---

## 📊 Resource Limits

### Set Memory/CPU Limits

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Monitor Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats aqbobek_backend

# Export data
docker stats --no-stream > stats.txt
```

---

## 🔄 Update & Upgrade Strategy

### Update Base Images

```bash
# Check for updates
docker pull python:3.11-slim
docker pull node:18-alpine

# Rebuild with latest base
docker-compose build --pull

# Deploy new images
docker-compose up -d
```

### Semantic Versioning

```dockerfile
# For tags
FROM python:3.11.2-slim  # ❌ Too specific (pinned version)
FROM python:3.11-slim    # ✅ Good (minor updates auto)
FROM python:3-slim       # ⚠️  Major updates (risky)
```

### Update Strategy in Compose

```yaml
# Auto-update service
docker-compose pull
docker-compose up -d --force-recreate
```

---

## 📈 Performance Tuning

### Backend (Python/Gunicorn)

```dockerfile
# Current settings in Dockerfile
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", \
  "--preload", \           # Faster worker forking
  "-w", "4", \            # 4 workers
  "--threads", "10", \    # 10 threads per worker
  "-b", "0.0.0.0:5000", \
  "--timeout", "120", \
  "app:create_app()"]
```

Tuning hints:
- Workers = 2 × CPU cores + 1
- Threads = min(10, CPU cores)
- Timeout = max expected request time

### Frontend (Node)

```dockerfile
# Already optimized
# - Multi-stage build (small final size)
# - Serve static files (fast CDN-ready)
# - No unnecessary dependencies
```

### Database

```python
# In app.py (SQLAlchemy config)
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
}
```

---

## 🚀 Scaling

### Horizontal Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# With load balancer (Nginx)
upstream backend {
    least_conn;
    server backend:5000;
    server backend:5001;
    server backend:5002;
}
```

### Vertical Scaling

Increase resource limits:
```yaml
resources:
  limits:
    memory: 2G        # Increase from 1G
    cpus: '2'         # Increase from 1
```

---

## 📋 Health Checks

### Backend Health

```python
@app.route('/api/health')
@app.route('/healthz')
def health():
    try:
        # Check database
        db.session.execute(text('SELECT 1'))
        status = 'healthy'
    except:
        status = 'unhealthy'
    
    return {
        'status': status,
        'timestamp': datetime.now().isoformat()
    }, 200 if status == 'healthy' else 503
```

### Health Check Configuration

In docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Kubernetes health:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

## 🐛 Debugging

### View Container Logs

```bash
# Real-time
docker logs -f aqbobek_backend

# Last 100 lines
docker logs --tail 100 aqbobek_backend

# With timestamps
docker logs --timestamps aqbobek_backend

# Export logs
docker logs aqbobek_backend > backend.log 2>&1
```

### Execute Commands

```bash
# Interactive shell
docker exec -it aqbobek_backend /bin/bash

# Single command
docker exec aqbobek_backend python -c "print('hello')"

# As different user
docker exec -u appuser aqbobek_backend id
```

### Inspect Container

```bash
# Full details (JSON)
docker inspect aqbobek_backend

# Specific field
docker inspect -f '{{.State.Running}}' aqbobek_backend

# Network info
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' aqbobek_backend
```

---

## 📚 Docker Compose Tips

### Environment-Specific Files

```bash
# Base config
docker-compose.yml

# Development overrides
docker-compose.dev.yml

# Production config
docker-compose.prod.yml

# Testing
docker-compose.test.yml

# Usage
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Variable Expansion

```yaml
# Use .env file
services:
  backend:
    image: ${DOCKER_REGISTRY}/aqbobek-backend:${VERSION}
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

`.env` file:
```env
DOCKER_REGISTRY=ghcr.io
VERSION=1.0.0
DATABASE_URL=postgresql://...
```

---

## 🔗 References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Container Image Security](https://docs.docker.com/engine/security/)
- [Docker Performance Tuning](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Production Ready
