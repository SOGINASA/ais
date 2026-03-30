# Aqbobek Lyceum Portal — Frontend Architecture

## Стек
- **React 18** (Create React App)
- **Tailwind CSS 3** — утилитарные стили + custom tokens
- **Zustand 5** — глобальный стейт (store per domain)
- **React Router 6** — клиентский роутинг с role-guards
- **Recharts + D3** — графики и Knowledge Graph
- **MSW 2** — Mock Service Worker для BilimClass API
- **Axios** — HTTP-клиент
- **date-fns** — работа с датами
- **react-hot-toast** — Push-уведомления в UI

---

## Ролевая модель

| Роль      | Константа       | Маршрут-префикс |
|-----------|-----------------|-----------------|
| Ученик    | `ROLE.STUDENT`  | `/student/*`    |
| Учитель   | `ROLE.TEACHER`  | `/teacher/*`    |
| Родитель  | `ROLE.PARENT`   | `/parent/*`     |
| Админ     | `ROLE.ADMIN`    | `/admin/*`      |
| Kiosk     | `ROLE.KIOSK`    | `/kiosk`        |

---

## Структура файлов

```
frontend/
├── public/
│   └── index.html
│
├── tailwind.config.js
├── package.json
│
└── src/
    ├── index.js                    # ReactDOM.render + MSW bootstrap
    ├── App.js                      # Router + Layout switcher
    │
    ├── api/                        # Весь сетевой слой
    │   ├── bilimclass/
    │   │   ├── client.js           # Axios instance (baseURL, interceptors)
    │   │   ├── grades.js           # GET /grades, /quarter-grades
    │   │   ├── attendance.js       # GET /attendance
    │   │   ├── students.js         # GET /students, /student/:id
    │   │   └── mock/
    │   │       ├── handlers.js     # MSW request handlers (все эндпоинты)
    │   │       └── data/
    │   │           ├── students.js
    │   │           ├── grades.js
    │   │           ├── schedule.js
    │   │           └── achievements.js
    │   ├── ai/
    │   │   ├── client.js           # Axios instance для LLM gateway
    │   │   ├── tutor.js            # POST /ai/tutor/chat
    │   │   ├── analytics.js        # POST /ai/analytics/knowledge-graph
    │   │   ├── reports.js          # POST /ai/reports/class-summary
    │   │   └── predictions.js      # POST /ai/predict/soch-risk
    │   ├── notifications.js        # WebSocket / SSE подписка
    │   ├── schedule.js             # CRUD расписания
    │   └── portfolio.js            # CRUD портфолио
    │
    ├── store/                      # Zustand — один store на домен
    │   ├── index.js                # Re-export всех stores
    │   ├── authStore.js            # user, role, token, login/logout
    │   ├── gradesStore.js          # grades[], quarterAvg, trend
    │   ├── scheduleStore.js        # schedule[][], conflicts[], substitutions[]
    │   ├── notificationsStore.js   # notifications[], unreadCount
    │   ├── portfolioStore.js       # achievements[], certificates[], olympiads[]
    │   ├── leaderboardStore.js     # leaderboard[], userRank, xp
    │   ├── analyticsStore.js       # knowledgeGraph, riskScore, predictions[]
    │   ├── kioskStore.js           # topStudents[], announcements[], autoScroll
    │   └── feedStore.js            # posts[], filters, pagination
    │
    ├── router/
    │   ├── index.js                # <BrowserRouter> + routes mount
    │   ├── routes.js               # Все маршруты как константы
    │   ├── PrivateRoute.js         # Редирект на /login если нет токена
    │   └── RoleRoute.js            # Редирект если роль не совпадает
    │
    ├── layouts/
    │   ├── AuthLayout/
    │   │   ├── index.js
    │   │   ├── AuthLayout.js       # Центрированная форма + фон
    │   │   └── AuthBackground.js   # Анимированный SVG-фон
    │   ├── MainLayout/
    │   │   ├── index.js
    │   │   └── MainLayout.js       # Sidebar + Header + <Outlet />
    │   └── KioskLayout/
    │       ├── index.js
    │       ├── KioskLayout.js      # Fullscreen, no nav, крупный шрифт
    │       └── KioskAutoScroll.js  # Хук-обёртка для авто-скролла
    │
    ├── pages/                      # Страницы = composing компонентов
    │   ├── auth/
    │   │   ├── LoginPage.js        # Форма входа
    │   │   └── SelectRolePage.js   # Выбор роли (demo)
    │   ├── student/
    │   │   ├── StudentDashboardPage.js    # Сводный дашборд
    │   │   ├── StudentGradesPage.js       # Таблица оценок + графики
    │   │   ├── StudentAITutorPage.js      # AI-тьютор + Knowledge Graph
    │   │   ├── StudentPortfolioPage.js    # Портфолио + Timeline
    │   │   ├── StudentLeaderboardPage.js  # Лидерборд + ачивки
    │   │   └── StudentSchedulePage.js     # Расписание ученика
    │   ├── teacher/
    │   │   ├── TeacherDashboardPage.js    # Сводка + EarlyWarning виджет
    │   │   ├── TeacherEarlyWarningPage.js # Полный дашборд рисков
    │   │   ├── TeacherReportsPage.js      # AI-генерация отчётов
    │   │   ├── TeacherClassPage.js        # Журнал + успеваемость класса
    │   │   └── TeacherSchedulePage.js     # Расписание учителя
    │   ├── parent/
    │   │   ├── ParentDashboardPage.js     # Observer-режим ребёнка
    │   │   ├── ParentChildPage.js         # Оценки + посещаемость ребёнка
    │   │   └── ParentWeeklySummaryPage.js # AI-выжимка за неделю
    │   ├── admin/
    │   │   ├── AdminDashboardPage.js      # Сводные метрики школы
    │   │   ├── AdminRadarPage.js          # Global Radar по параллелям
    │   │   ├── AdminNotificationsPage.js  # Публикация событий + таргетинг
    │   │   ├── AdminSchedulePage.js       # Ручное управление расписанием
    │   │   └── AdminSmartSchedulePage.js  # Smart Schedule Builder
    │   └── kiosk/
    │       └── KioskPage.js               # Kiosk Mode — интерактивная стенгазета
    │
    ├── components/
    │   │
    │   ├── ui/                     # Атомарные UI-примитивы (design system)
    │   │   ├── Button/
    │   │   │   ├── Button.js       # variant: primary|secondary|ghost|danger
    │   │   │   ├── IconButton.js   # Кнопка только с иконкой
    │   │   │   └── ButtonGroup.js  # Группа кнопок
    │   │   ├── Input/
    │   │   │   ├── TextInput.js
    │   │   │   ├── SearchInput.js  # + иконка лупы + debounce
    │   │   │   └── SelectInput.js
    │   │   ├── Card/
    │   │   │   ├── Card.js         # Базовая карточка (shadow, rounded)
    │   │   │   ├── CardHeader.js
    │   │   │   ├── CardBody.js
    │   │   │   └── CardFooter.js
    │   │   ├── Badge/
    │   │   │   ├── Badge.js        # Цветной тег
    │   │   │   └── StatusBadge.js  # online|away|risk
    │   │   ├── Avatar/
    │   │   │   ├── Avatar.js       # Фото или инициалы
    │   │   │   └── AvatarGroup.js  # Стопка аватаров
    │   │   ├── Modal/
    │   │   │   ├── Modal.js        # Portal + backdrop
    │   │   │   ├── ModalHeader.js
    │   │   │   ├── ModalBody.js
    │   │   │   └── ModalFooter.js
    │   │   ├── Tooltip/Tooltip.js
    │   │   ├── Spinner/Spinner.js
    │   │   ├── Alert/Alert.js      # info|success|warning|error
    │   │   ├── Tabs/
    │   │   │   ├── Tabs.js
    │   │   │   ├── Tab.js
    │   │   │   └── TabPanel.js
    │   │   ├── Table/
    │   │   │   ├── Table.js
    │   │   │   ├── TableHead.js
    │   │   │   ├── TableRow.js
    │   │   │   └── TableCell.js
    │   │   ├── ProgressBar/ProgressBar.js
    │   │   └── Dropdown/
    │   │       ├── Dropdown.js
    │   │       └── DropdownItem.js
    │   │
    │   ├── charts/                 # Переиспользуемые графики (Recharts/D3)
    │   │   ├── GradeLineChart/     # Динамика оценок по времени
    │   │   ├── SubjectRadarChart/  # Spider-чарт по предметам
    │   │   ├── AttendanceBarChart/ # Посещаемость по неделям
    │   │   ├── RiskHeatmap/        # Тепловая карта рисков класса
    │   │   └── KnowledgeGraph/     # D3 граф знаний студента
    │   │
    │   ├── navigation/
    │   │   ├── Sidebar/
    │   │   │   ├── Sidebar.js      # Коллапсируемый сайдбар
    │   │   │   ├── SidebarItem.js  # Пункт меню + active state
    │   │   │   ├── SidebarSection.js
    │   │   │   └── SidebarProfile.js  # Мини-карточка юзера внизу
    │   │   ├── Header/
    │   │   │   ├── Header.js
    │   │   │   ├── HeaderLogo.js
    │   │   │   ├── HeaderSearch.js
    │   │   │   ├── HeaderNotifications.js  # Колокольчик + badge
    │   │   │   └── HeaderUserMenu.js       # Дропдаун профиля
    │   │   └── Breadcrumb/Breadcrumb.js
    │   │
    │   ├── notifications/
    │   │   ├── NotificationBell/   # Иконка + счётчик непрочитанных
    │   │   ├── NotificationPanel/
    │   │   │   ├── NotificationPanel.js  # Выдвижная панель
    │   │   │   └── NotificationItem.js   # Одно уведомление
    │   │   └── PushNotificationToast/    # Toast для замен в расписании
    │   │
    │   ├── grades/
    │   │   ├── GradeCard/
    │   │   │   ├── GradeCard.js      # Крупная карточка предмета + оценка
    │   │   │   └── GradeCardMini.js  # Компактная версия для дашборда
    │   │   ├── GradesTable/
    │   │   │   ├── GradesTable.js    # Журнал оценок с сортировкой
    │   │   │   └── GradesTableRow.js
    │   │   ├── SubjectGradeBlock/    # Блок предмета: оценка + тренд + прогресс
    │   │   └── GradeTrendIndicator/  # Стрелка вверх/вниз + % изменение
    │   │
    │   ├── ai/
    │   │   ├── AIPredictionCard/
    │   │   │   ├── AIPredictionCard.js  # "С вер-тью 80% завалишь СОЧ по X"
    │   │   │   └── AIPredictionRisk.js  # Индикатор уровня риска
    │   │   ├── AITutorChat/
    │   │   │   ├── AITutorChat.js    # Чат-интерфейс с тьютором
    │   │   │   ├── AITutorMessage.js # Пузырь сообщения (user|ai)
    │   │   │   └── AITutorInput.js   # Поле ввода + отправка
    │   │   ├── KnowledgeGapCard/     # Карточка пробела в знаниях
    │   │   ├── VideoLectureRecommendation/
    │   │   │   ├── VideoLectureRecommendation.js  # Список рекомендаций
    │   │   │   └── VideoLectureCard.js            # Одна видеолекция
    │   │   ├── AIReportGenerator/
    │   │   │   ├── AIReportGenerator.js  # Кнопка "Сгенерировать" + статус
    │   │   │   └── AIReportPreview.js    # Предпросмотр + экспорт
    │   │   └── WeeklySummaryCard/    # AI-выжимка для родителя
    │   │
    │   ├── portfolio/
    │   │   ├── PortfolioHeader/      # Фото + имя + общий рейтинг
    │   │   ├── AchievementCard/
    │   │   │   ├── AchievementCard.js
    │   │   │   └── AchievementBadge.js  # Визуальный значок ачивки
    │   │   ├── CertificateCard/      # Верифицированный сертификат
    │   │   ├── OlympiadCard/         # Результат олимпиады
    │   │   └── PortfolioTimeline/
    │   │       ├── PortfolioTimeline.js
    │   │       └── PortfolioTimelineItem.js
    │   │
    │   ├── gamification/
    │   │   ├── Leaderboard/
    │   │   │   ├── Leaderboard.js        # Полная таблица
    │   │   │   ├── LeaderboardRow.js     # Строка с медалью/позицией
    │   │   │   └── LeaderboardTopThree.js  # Пьедестал (1-2-3)
    │   │   ├── AchievementPopup/         # Анимированный попап разблокировки
    │   │   ├── GoalTracker/
    │   │   │   ├── GoalTracker.js
    │   │   │   └── GoalItem.js           # Цель + прогресс-бар
    │   │   └── XPProgressBar/            # Полоска опыта до следующего уровня
    │   │
    │   ├── schedule/
    │   │   ├── ScheduleGrid/
    │   │   │   ├── ScheduleGrid.js       # Сетка расписания (дни × время)
    │   │   │   ├── ScheduleCell.js       # Одна ячейка (может быть пустой)
    │   │   │   ├── ScheduleHeader.js     # Заголовок дней недели
    │   │   │   └── ScheduleTimeColumn.js # Левая колонка со временем
    │   │   ├── LessonCard/
    │   │   │   ├── LessonCard.js         # Карточка урока в ячейке
    │   │   │   └── LessonCardCompact.js  # Мини-версия для Kiosk
    │   │   ├── SmartScheduleBuilder/
    │   │   │   ├── SmartScheduleBuilder.js  # Оркестратор билдера
    │   │   │   ├── ConstraintsPanel/
    │   │   │   │   ├── ConstraintsPanel.js  # Панель ограничений
    │   │   │   │   ├── TeacherAvailability.js  # Слоты учителей
    │   │   │   │   ├── RoomAvailability.js     # Доступность кабинетов
    │   │   │   │   └── StreamConfig.js         # Настройка лент (потоков)
    │   │   │   ├── GeneratedSchedulePreview/   # Предпросмотр результата
    │   │   │   └── ConflictAlert/              # Предупреждение о конфликте
    │   │   ├── SubstitutionPanel/
    │   │   │   ├── SubstitutionPanel.js   # Список замен
    │   │   │   └── SubstitutionRequest.js # Форма создания замены
    │   │   └── EventCard/
    │   │       ├── EventCard.js       # Мероприятие / академический час
    │   │       └── EventCardStream.js # Потоковое мероприятие (несколько классов)
    │   │
    │   ├── teacher/
    │   │   ├── EarlyWarningDashboard/
    │   │   │   ├── EarlyWarningDashboard.js  # Список учеников под риском
    │   │   │   ├── RiskStudentCard/          # Карточка ученика + индикатор
    │   │   │   └── AnomalyIndicator/         # Визуал аномального падения
    │   │   └── ClassOverview/                # Сводка по классу
    │   │
    │   ├── admin/
    │   │   ├── GlobalRadar/
    │   │   │   ├── GlobalRadar.js            # Сводный дашборд школы
    │   │   │   ├── GradeParallelCard/        # Карточка параллели (5А, 5Б…)
    │   │   │   └── SubjectPerformanceCard/   # Успеваемость по предмету
    │   │   ├── NewsPublisher/
    │   │   │   ├── NewsPublisher.js          # Оркестратор публикации
    │   │   │   ├── NewsEditor.js             # Rich-text редактор поста
    │   │   │   └── AudienceSelector.js       # Таргетинг по классам/ролям
    │   │   └── StatCard/                     # Метрика с иконкой и трендом
    │   │
    │   ├── kiosk/
    │   │   ├── KioskFeed/
    │   │   │   ├── KioskFeed.js      # Лента с авто-скроллом
    │   │   │   └── KioskFeedItem.js  # Один элемент ленты
    │   │   ├── KioskTopStudents/     # Топ-ученики дня (крупно)
    │   │   ├── KioskScheduleChanges/ # Актуальные замены (крупно)
    │   │   ├── KioskAnnouncementBanner/ # Анонс события (fullwidth)
    │   │   └── KioskClock/           # Часы + дата (постоянно видны)
    │   │
    │   └── feed/
    │       ├── FeedPost/
    │       │   ├── FeedPost.js       # Пост в ленте (текст + медиа)
    │       │   └── FeedPostMedia.js  # Фото/видео вложение
    │       ├── FeedEventAnnouncement/ # Карточка анонса события
    │       └── FeedFilters/           # Фильтр ленты по категориям
    │
    ├── hooks/
    │   ├── useAuth.js               # Авторизация + role-check
    │   ├── useGrades.js             # Загрузка оценок + кеш
    │   ├── useSchedule.js           # CRUD расписания
    │   ├── useNotifications.js      # WebSocket подписка на уведомления
    │   ├── useAITutor.js            # Стрим чата с тьютором
    │   ├── useKioskAutoScroll.js    # requestAnimationFrame авто-скролл
    │   ├── useEarlyWarning.js       # Алгоритм раннего предупреждения
    │   ├── useSmartSchedule.js      # Запуск алгоритма генерации расписания
    │   ├── usePredictiveAnalytics.js # Вызов собственного предиктивного движка
    │   └── useWebSocket.js          # Базовый хук WebSocket-соединения
    │
    ├── utils/
    │   ├── gradeCalculator.js   # Средний балл, квартальная оценка, тренд
    │   ├── riskScorer.js        # Собственный алгоритм оценки риска (не LLM)
    │   ├── scheduleGenerator.js # Алгоритм генерации расписания без конфликтов
    │   ├── conflictDetector.js  # Детекция overlap'ов учителей/кабинетов
    │   ├── predictiveModel.js   # Предиктивная модель СОЧ (статистика + ML-lite)
    │   ├── reportBuilder.js     # Формирование структуры отчёта для AI
    │   ├── dateHelpers.js       # Форматы дат, day-of-week, term-weeks
    │   ├── roleHelpers.js       # can(role, action), getHomePage(role)
    │   └── streamBuilder.js     # Построение лент (параллельных потоков)
    │
    ├── constants/
    │   ├── roles.js             # ROLE.STUDENT | TEACHER | PARENT | ADMIN | KIOSK
    │   ├── subjects.js          # Список предметов + цвета
    │   ├── scheduleTypes.js     # LESSON | PAIR | STREAM | EVENT | ACADEMIC_HOUR
    │   ├── achievementTypes.js  # Типы ачивок + пороги XP
    │   ├── routes.js            # Все URL-константы
    │   └── riskThresholds.js   # Пороги LOW | MEDIUM | HIGH риска
    │
    └── styles/
        ├── index.css            # Tailwind directives + Inter font import
        └── kiosk.css            # Kiosk-специфичные overrides (шрифты, z-index)
```

---

## Потоки данных (Data Flow)

```
BilimClass API / MSW Mock
         │
         ▼
   api/bilimclass/*          api/ai/*
         │                      │
         ▼                      ▼
    Zustand Store ◄─────── hooks/use*.js
         │
         ▼
    Pages (composing)
         │
         ▼
    Components (rendering)
```

## Алгоритмы (не LLM)

| Файл                       | Что делает                                         |
|----------------------------|----------------------------------------------------|
| `utils/riskScorer.js`      | Z-score аномалии + скользящее среднее оценок       |
| `utils/predictiveModel.js` | Линейная регрессия по истории оценок → вероятность провала СОЧ |
| `utils/scheduleGenerator.js` | Backtracking CSP-solver для расписания без конфликтов |
| `utils/conflictDetector.js`  | Проверка overlap учителей, кабинетов, потоков    |
| `utils/streamBuilder.js`   | Разбивка параллели на профильные группы с балансировкой |

## AI (LLM) интеграция

Используется только для генерации **текстовых** выходов на основе уже посчитанных алгоритмами данных:
- `api/ai/tutor.js` — объяснение пробелов в знаниях
- `api/ai/reports.js` — текстовый отчёт учителя (на вход идёт готовая структура из `reportBuilder.js`)
- `api/ai/predictions.js` — обогащение предсказания рекомендациями видеолекций

## Kiosk Mode

- `KioskLayout` — `position: fixed; inset: 0`, `overflow: hidden`, cursor none
- `useKioskAutoScroll` — `requestAnimationFrame` loop, скорость настраивается через `kioskStore`
- `KioskFeed` — дублирует контент (`[...items, ...items]`) для бесконечного скролла
- Шрифт `kiosk.css` — Montserrat 4xl+, line-height увеличен для панелей в коридоре
