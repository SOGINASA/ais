# 🚀 Deployment Guide

Production deployment instructions for various platforms.

## 📋 Pre-Deployment Checklist

- [ ] `.env` file configured with production values
- [ ] SECRET_KEY and JWT_SECRET_KEY are random & strong
- [ ] GROQ_API_KEY added (or accept mock responses)
- [ ] CORS_ORIGINS updated to your domain
- [ ] DATABASE_URL points to PostgreSQL (not SQLite)
- [ ] FRONTEND_DOMAIN set correctly
- [ ] All tests passing
- [ ] Docker images built and tested locally

---

## 🐳 Docker Hub

Build and push images for reuse across platforms:

```bash
# Build backend
docker build -t your-username/aqbobek-backend:1.0 backend/

# Build frontend
docker build -t your-username/aqbobek-frontend:1.0 frontend/

# Push to Docker Hub
docker push your-username/aqbobek-backend:1.0
docker push your-username/aqbobek-frontend:1.0
```

Then use in docker-compose:
```yaml
services:
  backend:
    image: your-username/aqbobek-backend:1.0
  frontend:
    image: your-username/aqbobek-frontend:1.0
```

---

## ☁️ Heroku

### Method 1: Using Docker

```bash
# Login to Heroku
heroku login
heroku container:login

# Create app
heroku create aqbobek-backend

# Push Docker image
heroku container:push web --app aqbobek-backend
heroku container:release web --app aqbobek-backend

# Set environment variables
heroku config:set SECRET_KEY=<random-value> --app aqbobek-backend
heroku config:set JWT_SECRET_KEY=<random-value> --app aqbobek-backend
heroku config:set GROQ_API_KEY=<your-key> --app aqbobek-backend
heroku config:set DATABASE_URL=postgresql://... --app aqbobek-backend
```

### Method 2: Using Git

```bash
heroku create aqbobek-backend
git push heroku main

# For frontend
heroku create aqbobek-frontend
cd frontend
git push heroku main
```

---

## 🐧 Linux Server (VPS)

### Prerequisites
```bash
# Update system
sudo apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment

```bash
# Clone repository
git clone <your-repo> /opt/aqbobek
cd /opt/aqbobek/backend

# Create environment file
nano .env
# Add production values

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

### Setup Nginx Reverse Proxy

```bash
sudo apt-get install -y nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/aqbobek << EOF
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name aqbobek.example.com;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/aqbobek /etc/nginx/sites-enabled/

# Test and start
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot --nginx -d aqbobek.example.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## ☸️ Kubernetes

### Using Helm Chart

```bash
# Create namespace
kubectl create namespace aqbobek

# Create ConfigMap for environment
kubectl create configmap aqbobek-config \
  --from-literal=FLASK_ENV=production \
  --from-literal=CORS_ORIGINS=https://aqbobek.example.com \
  -n aqbobek

# Create Secret for sensitive data
kubectl create secret generic aqbobek-secrets \
  --from-literal=SECRET_KEY=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET_KEY=$(openssl rand -base64 32) \
  --from-literal=GROQ_API_KEY=<your-key> \
  -n aqbobek

# Deploy using manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/services.yaml
```

### Example Kubernetes Manifest

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aqbobek-backend
  namespace: aqbobek
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-username/aqbobek-backend:1.0
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          valueFrom:
            configMapKeyRef:
              name: aqbobek-config
              key: FLASK_ENV
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: aqbobek-secrets
              key: SECRET_KEY
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/auth/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## 🟦 AWS (ECS + RDS)

### 1. Create RDS PostgreSQL Database

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier aqbobek-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username aqbobek \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

### 2. Create ECS Task Definition

```json
{
  "family": "aqbobek-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-username/aqbobek-backend:1.0",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:aqbobek-secrets"
        }
      ]
    }
  ]
}
```

### 3. Deploy with ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster aqbobek \
  --service-name backend \
  --task-definition aqbobek-backend \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=5000
```

---

## 🟠 DigitalOcean

### Using App Platform

```bash
# Create app.yaml
cat > app.yaml << 'EOF'
name: aqbobek
services:
- name: backend
  github:
    repo: your-username/aqbobek
    branch: main
  source_dir: backend
  http_port: 5000
  build_command: pip install -r requirements.txt
  run_command: gunicorn app:create_app()
  envs:
  - key: FLASK_ENV
    value: production
  - key: SECRET_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${SECRET_KEY}
  
- name: frontend
  github:
    repo: your-username/aqbobek
    branch: main
  source_dir: frontend
  http_port: 3000
  build_command: npm install && npm run build
  run_command: npm start
EOF

# Deploy
doctl apps create --spec app.yaml
```

---

## 📦 Docker Swarm

### Initialize Swarm

```bash
# On manager node
docker swarm init

# On worker nodes
docker swarm join --token <token> <manager-ip>:2377
```

### Deploy Stack

```bash
# Create stack file
docker stack deploy -c docker-compose.prod.yml aqbobek

# Check status
docker stack ps aqbobek

# Scale service
docker service scale aqbobek_backend=3

# View logs
docker service logs aqbobek_backend
```

---

## 🔐 Environment Variables for Production

```sh
# Security
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">
JWT_SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">

# Database
DATABASE_URL=postgresql://aqbobek:password@postgres.example.com:5432/aqbobek

# Flask
FLASK_ENV=production
FLASK_APP=app.py

# CORS
CORS_ORIGINS=https://aqbobek.example.com,https://www.aqbobek.example.com

# AI
GROQ_API_KEY=gsk_...
GROQ_MODEL=mixtral-8x7b-32768

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/aqbobek/app.log

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=app-password

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat-id>

# Frontend
REACT_APP_API_BASE=https://api.aqbobek.example.com
REACT_APP_USE_MOCK=false
```

---

## 📊 Monitoring & Logging

### Prometheus (Metrics)

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
```

### ELK Stack (Logging)

```bash
# Elasticsearch
docker run -d --name elasticsearch \
  -e discovery.type=single-node \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0

# Kibana
docker run -d --name kibana -p 5601:5601 \
  docker.elastic.co/kibana/kibana:8.0.0

# Filebeat (ship backend logs)
docker run -d --name filebeat \
  -v ./backend/logs:/var/log/app \
  docker.elastic.co/beats/filebeat:8.0.0
```

### Health Checks

Implement health check endpoint:
```python
@app.route('/api/health')
def health():
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': time.time() - app.start_time
    }
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Automated)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push
        run: |
          docker build -t your-username/aqbobek-backend:latest backend/
          docker push your-username/aqbobek-backend:latest
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/aqbobek/backend
            docker-compose pull
            docker-compose up -d
```

---

## 🧪 Testing Before Deployment

```bash
# Run all tests locally
docker-compose -f docker-compose.dev.yml run backend pytest
docker-compose -f docker-compose.dev.yml run frontend npm test

# Load testing
ab -n 1000 -c 100 http://localhost:5000/api/auth/health

# Security scan
docker run -v /opt/aqbobek:/src aquasec/trivy image your-username/aqbobek-backend:latest
```

---

## 📈 Post-Deployment

1. **Monitor Logs**: `docker-compose logs -f`
2. **Check Health**: `curl https://api.aqbobek.example.com/api/health`
3. **Verify Database**: `psql postgresql://...`
4. **Test Frontend**: Open browser to https://aqbobek.example.com
5. **Setup Backups**: Daily PostgreSQL backups
6. **Enable Metrics**: Prometheus/Grafana for monitoring

---

## 🆘 Rollback

```bash
# If deployment fails
docker-compose down

# Revert to previous version
git revert <commit-hash>
docker-compose build
docker-compose up -d
```

---

## 📚 Additional Resources

- [Docker Deployment Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Heroku Deployment Guide](https://devcenter.heroku.com/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Production Ready
