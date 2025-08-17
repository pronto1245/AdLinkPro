# 📁 Структура проекта Affiliate Pro

## 🎯 Корневые файлы
```
├── package.json                    # Зависимости и скрипты NPM
├── package-lock.json               # Точные версии зависимостей
├── tsconfig.json                   # Конфигурация TypeScript
├── vite.config.ts                  # Настройки Vite сборщика
├── drizzle.config.ts               # Конфигурация ORM
├── components.json                 # Настройки UI компонентов
├── tailwind.config.ts              # Конфигурация Tailwind CSS
├── postcss.config.js               # PostCSS обработка стилей
├── Dockerfile                      # Docker контейнеризация
├── .env.example                    # Шаблон переменных окружения
├── README_DEPLOY.md                # Документация по деплою
├── DEPLOYMENT_SECRETS.md           # Секретные переменные
├── replit.md                       # Архитектура и настройки проекта
```

## 🖥️ Фронтенд (client/)
```
client/
├── src/
│   ├── components/                 # React компоненты
│   │   ├── ui/                     # Базовые UI компоненты (shadcn)
│   │   ├── layout/                 # Компоненты макета
│   │   ├── forms/                  # Формы и валидация
│   │   ├── charts/                 # Графики и аналитика
│   │   ├── events/                 # Система событий
│   │   └── modals/                 # Модальные окна
│   ├── pages/                      # Страницы приложения
│   │   ├── auth/                   # Аутентификация
│   │   ├── super-admin/            # Панель супер админа
│   │   ├── advertiser/             # Кабинет рекламодателя
│   │   ├── affiliate/              # Кабинет партнера
│   │   └── staff/                  # Интерфейс персонала
│   ├── contexts/                   # React контексты
│   │   ├── auth-context.tsx        # Контекст аутентификации
│   │   ├── ThemeContext.tsx        # Управление темой
│   │   ├── LanguageContext.tsx     # Многоязычность
│   │   └── sidebar-context.tsx     # Состояние сайдбара
│   ├── hooks/                      # Кастомные React хуки
│   │   ├── useAuth.ts              # Хук аутентификации
│   │   ├── useWebSocket.ts         # WebSocket подключения
│   │   ├── useSendEvent.ts         # Отправка событий
│   │   └── useDebounce.ts          # Дебаунсинг
│   ├── lib/                        # Утилитарные библиотеки
│   │   ├── auth.ts                 # Логика аутентификации
│   │   ├── fetchJSON.ts            # HTTP клиент
│   │   ├── queryClient.ts          # React Query настройки
│   │   ├── utils.ts                # Общие утилиты
│   │   └── i18n.ts                 # Интернационализация
│   ├── utils/                      # Вспомогательные функции
│   │   ├── formatters.ts           # Форматирование данных
│   │   ├── categories.ts           # Работа с категориями
│   │   └── formatting.ts           # Форматирование текста
│   ├── App.tsx                     # Главный компонент
│   ├── main.tsx                    # Точка входа React
│   └── index.css                   # Глобальные стили
├── index.html                      # HTML шаблон
└── public/                         # Статические файлы
    ├── vite.svg                    # Иконки
    └── favicon.ico                 # Фавикон
```

## ⚙️ Бекенд (server/)
```
server/
├── config/                         # Конфигурационные файлы
│   └── environment.ts              # Валидация окружения
├── middleware/                     # Express middleware
│   ├── auth.ts                     # Аутентификация
│   ├── cors.ts                     # CORS настройки
│   ├── rate-limiting.ts            # Ограничение запросов
│   └── error-handling.ts           # Обработка ошибок
├── utils/                          # Серверные утилиты
│   ├── jwt.ts                      # JWT токены
│   ├── bcryptjs.ts                   # Хеширование паролей
│   ├── email.ts                    # Отправка email
│   └── validators.ts               # Валидация данных
├── services/                       # Бизнес логика
│   ├── auth.ts                     # Сервис аутентификации
│   ├── offers.ts                   # Управление офферами
│   ├── partners.ts                 # Управление партнерами
│   ├── analytics.ts                # Аналитика
│   ├── antifraud.ts                # Антифрод система
│   └── postbacks.ts                # Система постбеков
├── routes/                         # API маршруты
│   ├── auth.ts                     # Аутентификация
│   ├── offers.ts                   # CRUD офферов
│   ├── partners.ts                 # CRUD партнеров
│   ├── tracking.ts                 # Трекинг ссылки
│   ├── analytics.ts                # API аналитики
│   └── admin.ts                    # Админ функции
├── integrations/                   # Внешние интеграции
│   ├── voluum.ts                   # Интеграция с Voluum
│   ├── keitaro.ts                  # Интеграция с Keitaro
│   ├── binom.ts                    # Интеграция с Binom
│   ├── redtrack.ts                 # Интеграция с RedTrack
│   ├── sendgrid.ts                 # Email сервис
│   └── telegram.ts                 # Telegram бот
├── websocket/                      # WebSocket логика
│   ├── server.ts                   # WebSocket сервер
│   ├── handlers.ts                 # Обработчики событий
│   └── notifications.ts            # Уведомления
├── storage.ts                      # Абстракция для БД
├── routes.ts                       # Главный роутер
├── vite.ts                         # Vite интеграция
└── index.ts                        # Точка входа сервера
```

## 🗃️ Общие типы (shared/)
```
shared/
├── schema.ts                       # Схема базы данных (Drizzle)
├── types/                          # TypeScript типы
│   ├── auth.ts                     # Типы аутентификации
│   ├── offers.ts                   # Типы офферов
│   ├── partners.ts                 # Типы партнеров
│   ├── analytics.ts                # Типы аналитики
│   ├── postbacks.ts                # Типы постбеков
│   └── api.ts                      # API типы
├── constants/                      # Константы приложения
│   ├── roles.ts                    # Роли пользователей
│   ├── statuses.ts                 # Статусы
│   ├── currencies.ts               # Валюты
│   └── events.ts                   # События
├── validators/                     # Zod валидаторы
│   ├── auth.ts                     # Валидация auth
│   ├── offers.ts                   # Валидация офферов
│   ├── partners.ts                 # Валидация партнеров
│   └── settings.ts                 # Валидация настроек
└── utils/                          # Общие утилиты
    ├── formatters.ts               # Форматирование
    ├── validators.ts               # Валидация
    └── helpers.ts                  # Вспомогательные функции
```

## 🗄️ База данных (migrations/)
```
migrations/
├── 0000_flat_tempest.sql           # Начальная миграция
├── 0001_late_longshot.sql          # Дополнительные таблицы
├── meta/                           # Метаданные миграций
│   ├── _journal.json               # Журнал миграций
│   ├── 0000_snapshot.json          # Снапшот схемы
│   └── 0001_snapshot.json          # Снапшот схемы
└── seed/                           # Тестовые данные
    ├── users.sql                   # Тестовые пользователи
    ├── offers.sql                  # Тестовые офферы
    └── partners.sql                # Тестовые партнеры
```

## 📁 Статические файлы (public/)
```
public/
├── images/                         # Изображения
│   ├── logos/                      # Логотипы
│   ├── icons/                      # Иконки
│   └── backgrounds/                # Фоновые изображения
├── fonts/                          # Шрифты
├── css/                            # Дополнительные стили
└── js/                             # Дополнительные скрипты
```

## 🛠️ Скрипты (scripts/)
```
scripts/
├── build.sh                       # Скрипт сборки
├── deploy.sh                       # Скрипт деплоя
├── seed-db.js                      # Заполнение БД тестовыми данными
├── backup-db.js                    # Бекап базы данных
├── migrate.js                      # Применение миграций
└── generate-ssl.sh                 # Генерация SSL сертификатов
```

## 🔧 Основные компоненты системы

### 🎨 UI Компоненты (client/src/components/ui/)
- **Базовые**: Button, Input, Card, Badge, Avatar
- **Формы**: Form, Select, Checkbox, Radio, Switch
- **Навигация**: Tabs, Breadcrumb, Pagination
- **Модальные**: Dialog, Sheet, Popover, Tooltip
- **Данные**: Table, DataTable, Charts, Progress
- **Обратная связь**: Toast, Alert, Skeleton, Loading

### 🏗️ Архитектурные слои
1. **Presentation Layer** - React компоненты и страницы
2. **Business Logic Layer** - Services и хуки
3. **Data Access Layer** - Storage и API клиенты
4. **Database Layer** - Drizzle ORM и миграции
5. **Integration Layer** - Внешние API и сервисы

### 🔄 Потоки данных
1. **Authentication Flow** - JWT токены, refresh токены
2. **Authorization Flow** - Роли и разрешения
3. **Data Flow** - React Query кеширование
4. **Event Flow** - WebSocket уведомления
5. **File Flow** - Загрузка и обработка файлов

## 📊 Ключевые особенности

### ⚡ Производительность
- **Lazy Loading** - динамическая загрузка компонентов
- **Memoization** - React.memo и useMemo
- **Virtual Scrolling** - для больших списков
- **Query Caching** - кеширование API запросов
- **Asset Optimization** - сжатие изображений и кода

### 🔒 Безопасность
- **JWT Authentication** - безопасная аутентификация
- **RBAC** - ролевая модель доступа
- **Input Validation** - валидация всех входных данных
- **SQL Injection Protection** - параметризованные запросы
- **XSS Protection** - экранирование пользовательского ввода

### 🌍 Интернационализация
- **Multi-language Support** - поддержка русского и английского
- **Dynamic Translation** - динамическая смена языка
- **Locale Formatting** - форматирование чисел и дат
- **RTL Support** - поддержка письма справа налево

---
**Проект готов к продакшн использованию с полной документацией архитектуры!** 🚀