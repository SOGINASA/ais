FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

RUN mkdir -p /app/database /app/logs && chmod 777 /app/database /app/logs

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/api/auth/health', timeout=5)"

CMD ["/entrypoint.sh"]
