# Aqbobek Lyceum — School Management System

Платформа управления школой. Backend на Flask, frontend на React, всё в Docker. Четыре роли: ученик, учитель, родитель, администратор. Встроен AI-модуль на базе Groq API для анализа успеваемости.

---

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Стек](#стек)
- [Архитектура](#архитектура)
- [База данных](#база-данных)
- [API](#api)
- [Функциональность](#функциональность)
- [AI-модуль](#ai-модуль)
- [Конфигурация](#конфигурация)
- [Режимы запуска](#режимы-запуска)
- [Запуск без Docker](#запуск-без-docker)
- [Структура проекта](#структура-проекта)
- [Тестовые аккаунты](#тестовые-аккаунты)
- [Полезные команды](#полезные-команды)
- [Проверка работоспособности](#проверка-работоспособности)
- [Решение проблем](#решение-проблем)
- [Безопасность](#безопасность)
- [Документация](#документация)

---

## Быстрый старт

Требования: Docker и Docker Compose 2.0+, свободные порты 3000 и 5252.

```bash
git clone <repo-url>
cd ais/backend
cp .env.example .env
cd ..
docker-compose up --build
```

После запуска:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5252`

Заполнение демо-данными:

```bash
docker-compose exec backend python seed.py
```

Создаст 72+ учеников, 5 учителей, предметы, классы, 1600+ оценок, расписание, достижения, посещаемость.

---

## Стек

| Слой | Технологии |
|------|-----------|
| Backend | Flask 3.1, SQLAlchemy 2.0, Flask-JWT-Extended, Flask-Sock, APScheduler, Gunicorn |
| Frontend | React 18, Zustand, Axios, Tailwind CSS, Recharts, MSW |
| База данных | SQLite (dev) / PostgreSQL (prod) |
| AI | Groq API (mixtral-8x7b) с fallback на mock |
| Инфраструктура | Docker, Docker Compose, GitHub Actions |

---

## Архитектура

```
             +---------------------+---------------------+
             |                     |                     |
   +---------v---------+ +--------v--------+ +----------v----------+
   |  Frontend :3000   | |  Backend :5252  | |   WebSocket /ws    |
   |  React + Tailwind | |  Flask REST API | |   Notifications    |
   +-------------------+ +--------+--------+ +---------------------+
                                  |
                   +--------------+--------------+
                   |              |              |
             +-----v-----+ +-----v-----+ +-----v-----+
             | SQLalchemy| |  Groq AI | | Scheduler |
             |  Postgres | |  API      | | APScheduler|
             +-----------+ +-----------+ +-----------+
```

---

## База данных

9 моделей, 30+ внешних ключей с каскадным удалением.

| Модель | Назначение |
|--------|-----------|
| `User` | Пользователи (student, teacher, parent, admin) |
| `Subject` | Учебные предметы |
| `ClassModel` | Классы (9A, 9B, 10A и т.д.) |
| `Grade` | Оценки (1-5, вес, четверть) |
| `Schedule` | Расписание (день, время, кабинет, тип урока) |
| `Achievement` | Достижения и баллы |
| `Attendance` | Посещаемость (present, absent, late, excuse) |
| `AnalyticsSnapshot` | Кэшированные метрики |
| `Notification` | Уведомления в реальном времени |

Подробности в [backend/models.py](backend/models.py).

---

## API

35+ REST-эндпоинтов по 8 модулям:

| Модуль | Префикс | Что делает |
|--------|---------|-----------|
| Auth | `/api/auth` | Регистрация, вход, JWT refresh, OAuth (Google, GitHub, Telegram), WebAuthn |
| Student | `/api/student` | Оценки, четвертные оценки, лидерборд, портфолио, расписание, посещаемость, аналитика |
| Teacher | `/api/teacher` | Классы, студенты, выставление оценок, отметка посещаемости, детекция риска, AI-отчёты |
| AI | `/api/ai` | Отчёт по студенту, отчёт по классу, предсказания, анализ по предмету |
| Schedule | `/api/schedule` | Расписание класса/учителя/студента, генерация, проверка конфликтов |
| Admin | `/api/admin` | Управление пользователями, статистика, аудит-логи |
| Notifications | `/api/notifications` | CRUD уведомлений, Web Push подписки, настройки |
| Feedback | `/api/feedback` | Обратная связь |

Полная документация: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

---

## Функциональность

### Ученик

- Дашборд с оценками, расписанием, достижениями
- Аналитика: тренды успеваемости, детекция рисков
- Лидерборд класса с очками
- Портфолио достижений и сертификатов
- Персональное расписание
- Уведомления в реальном времени через WebSocket

### Учитель

- Управление классами и студентами
- Выставление оценок по предмету и четверти
- Автоматическое выявление отстающих учеников (risk detection)
- AI-отчёты по каждому студенту через Groq API
- Аналитика по классу

### Родитель

- Просмотр успеваемости ребёнка
- Посещаемость по предметам
- AI-выжимка за неделю

### Администратор

- Управление пользователями, предметами, классами
- Генерация расписания (backtracking CSP-solver, без конфликтов)
- Сводные метрики школы
- Аудит-логи

---

## AI-модуль

Модуль на базе Groq API (mixtral-8x7b-32768). Анализирует успеваемость, выявляет зоны риска, даёт рекомендации.

Логика работы:

1. Вычисляются 7 метрик студента (средний балл, тренд, риск, посещаемость, предметы, достижения)
2. Метрики отправляются в Groq API (или используется mock если ключ не указан)
3. Ответ LLM парсится в структурированный формат
4. Возвращается `{summary, strengths[], weaknesses[], recommendations[]}`

Если `GROQ_API_KEY` не указан, система автоматически переключается на mock-режим — генерирует ответы на основе реальных метрик студента без обращения к внешнему API.

Реализация: [backend/services/ai_service.py](backend/services/ai_service.py).

---

## Конфигурация

Файл `backend/.env`:

| Переменная | Описание | Обязательно |
|-----------|----------|------------|
| `SECRET_KEY` | Flask secret key | Для production |
| `JWT_SECRET_KEY` | Подпись JWT токенов | Для production |
| `DATABASE_URL` | URL базы данных (SQLite или PostgreSQL) | Нет, есть default |
| `GROQ_API_KEY` | Ключ Groq API для AI-анализа | Нет, работает mock |
| `CORS_ORIGINS` | Допустимые origins через запятую | Нет |
| `FRONTEND_URL` | URL фронтенда (для OAuth) | Для OAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth | Для OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Для OAuth Google |
| `GITHUB_CLIENT_ID` | GitHub OAuth | Для OAuth GitHub |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | Для OAuth GitHub |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | Для Telegram Login |
| `VAPID_PRIVATE_KEY` | VAPID приватный ключ | Для Web Push |
| `VAPID_PUBLIC_KEY` | VAPID публичный ключ | Для Web Push |

Сгенерировать VAPID ключи:

```bash
flask generate-vapid
```

---

## Режимы запуска

### Стандартный

```bash
docker-compose up --build
```

### Development (с hot reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

Изменения в коде бэкенда и фронтенда подхватываются автоматически.

### Production (с PostgreSQL)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Через Makefile

```bash
make build       # Собрать образы
make up          # Запустить
make down        # Остановить
make restart     # Перезапустить
make dev         # Development с hot reload
make prod        # Production
make rebuild     # down + build + up
make clean       # Удалить контейнеры, volumes, images
```

---

## Запуск без Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -c "from app import create_app; app = create_app(); app.app_context().push()"
python seed.py
python app.py
```

Сервер: `http://localhost:5252`

### Frontend

```bash
cd frontend
npm install
npm start
```

Приложение: `http://localhost:3000`

MSW (Mock Service Worker) настроен и автоматически перехватывает API-запросы в development-режиме.

---

## Структура проекта

```
ais/
├── backend/
│   ├── app.py                    # App factory, WebSocket, CLI
│   ├── config.py                 # Конфигурация (dev/test/prod)
│   ├── models.py                 # SQLAlchemy модели
│   ├── seed.py                   # Генерация демо-данных
│   ├── routes/
│   │   ├── auth.py               # Регистрация, вход
│   │   ├── oauth.py              # Google, GitHub, Telegram
│   │   ├── webauthn.py           # Биометрия
│   │   ├── student.py            # API ученика
│   │   ├── teacher.py            # API учителя
│   │   ├── admin.py              # API администратора
│   │   ├── ai.py                 # AI-аналитика
│   │   ├── schedule.py           # Расписание
│   │   ├── notifications.py      # Уведомления
│   │   └── feedback.py           # Обратная связь
│   └── services/
│       ├── ai_service.py         # Groq API + mock fallback
│       ├── analytics_service.py  # Метрики и аналитика студентов
│       ├── oauth_service.py      # OAuth провайдеры
│       ├── websocket_service.py  # WebSocket реестр
│       ├── push_service.py       # Web Push
│       └── scheduler_service.py  # APScheduler
│
├── frontend/
│   └── src/
│       ├── api/                  # HTTP-клиенты, mock-данные
│       ├── store/                # Zustand stores
│       ├── hooks/                # Custom React hooks
│       ├── components/           # UI-компоненты
│       ├── pages/                # Страницы по ролям
│       ├── utils/                # Алгоритмы, хелперы
│       └── constants/            # Роли, предметы, пороги
│
├── docker-compose.yml            # Стандартный запуск
├── docker-compose.dev.yml        # Development с hot reload
├── docker-compose.prod.yml       # Production с PostgreSQL
├── Makefile                      # Команды управления
└── README.md
```

---

## Тестовые аккаунты

После запуска `seed.py` доступны два набора аккаунтов.

Основные:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@school.com` | `admin123` |
| Учитель | `teacher1@school.com` | `teacher123` |
| Ученик | `student1@school.com` | `student123` |

Демо-аккаунты (страница входа):

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@school.kz` | `password` |
| Учитель | `daria@school.kz` | `password` |
| Ученик | `ayman@school.kz` | `password` |
| Родитель | `zhanna.smagulova@example.kz` | `password` |

---

## Полезные команды

```bash
# Логи
make logs                  # Все сервисы
make logs-backend          # Только бэкенд
make logs-frontend         # Только фронтенд

# Статус
make ps                    # Список контейнеров
make health                # Проверка здоровья сервисов

# Доступ в контейнер
make backend-sh            # Shell бэкенда
make frontend-sh           # Shell фронтенда

# База данных
make seed                  # Заполнить демо-данными
make db-reset              # Сбросить базу
make db-shell              # SQLite shell

# Тестирование
make test                  # pytest
make format                # black, isort
make lint                  # flake8
```

---

## Проверка работоспособности

После запуска убедитесь:

- Backend отвечает: `http://localhost:5252/api/auth/health`
- Frontend доступен: `http://localhost:3000`
- Оба контейнера healthy: `make ps`
- Нет CORS-ошибок в консоли браузера
- Можно войти тестовым аккаунтом

---

## Решение проблем

| Проблема | Решение |
|----------|---------|
| Порт занят | `docker-compose down` или убить процесс на порту |
| Frontend не видит backend | Подождать 30 секунд (healthcheck), проверить CORS |
| База данных заблокирована | `docker-compose down -v` для сброса volumes |
| API возвращает 500 | `docker-compose logs backend` для диагностики |
| Не хватает памяти | Уменьшить ресурсы контейнеров или перейти на PostgreSQL |
| CORS ошибки | Проверить `CORS_ORIGINS` в `.env` |

---

## Безопасность

- JWT-токены с ограниченным сроком жизни + refresh-токены
- Role-based access control на всех защищённых эндпоинтах
- Валидация владения ресурсом (учитель видит только свои классы)
- Хэширование паролей через Werkzeug
- Защита от SQL-инъекций через SQLAlchemy ORM
- Секреты хранятся в `.env`, не попадают в git
- Поддержка HTTPS/TLS в production
- Аудит-логи auth-событий (IP, браузер, статус)
- WebAuthn для биометрической аутентификации

---

## Документация

| Документ | Содержание |
|----------|-----------|
| [backend/BACKEND_SETUP.md](backend/BACKEND_SETUP.md) | Настройка Flask, база данных, сервисы |
| [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) | Полная документация всех эндпоинтов |
| [backend/README.md](backend/README.md) | Структура бэкенда, модели, конфигурация |


Made by ITshechka team.