# 🚀 Affiliate Pro - Полная документация по деплою

## 📋 О проекте
Полнофункциональная платформа партнерского маркетинга с:
- React 18 + TypeScript + Vite (фронтенд)
- Node.js + Express + Drizzle ORM (бекенд)
- PostgreSQL база данных
- Система ролей (super_admin, advertiser, affiliate, staff)
- Антифрод система с AI
- Интеграция с трекерами (Voluum, Keitaro, Binom, RedTrack)
- WebSocket уведомления
- Object Storage для файлов

## 🔧 Быстрый запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
Создайте `.env` файл:
```env
# Обязательные переменные
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="your-256-bit-secret"
SESSION_SECRET="your-session-secret"

# Опциональные (для полной функциональности)
SENDGRID_API_KEY="sg.xxx"
VOLUUM_TOKEN="xxx"
KEITARO_TOKEN="xxx"
BINOM_TOKEN="xxx"
REDTRACK_TOKEN="xxx"
GOOGLE_CLOUD_PROJECT_ID="project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="bucket-name"
```

### 3. Инициализация базы данных
```bash
npm run db:push
```

### 4. Запуск проекта
```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## 🌐 Деплой на различные платформы

### Railway
1. Подключить GitHub репозиторий
2. Добавить переменные окружения
3. Railway автоматически деплоит

### Vercel
1. `npm install -g vercel`
2. `vercel --prod`
3. Настроить переменные в dashboard

### Netlify
1. Для статической сборки: `npm run build`
2. Загрузить `dist/` папку
3. Настроить редиректы для SPA

### Docker
```bash
docker build -t affiliate-pro .
docker run -p 5000:5000 --env-file .env affiliate-pro
```

## 👥 Тестовые аккаунты

### Super Admin
- Email: `admin@example.com`
- Password: `admin123`
- Доступ: Полное управление платформой

### Advertiser (Рекламодатель)
- Email: `advertiser1@example.com`
- Password: `adv123`
- Доступ: Управление офферами и партнерами

### Affiliate (Партнер)
- Email: `affiliate@test.com`
- Password: `aff123`
- Доступ: Просмотр офферов и статистики

## 🗄️ База данных

### Схема
- **users** - пользователи и роли
- **offers** - офферы с настройками
- **partners** - партнеры и их данные
- **clicks/conversions** - статистика трафика
- **postbacks** - настройки постбеков
- **fraud_alerts** - антифрод система

### Миграции
```bash
# Применить все миграции
npm run db:push

# Создать новую миграцию
npm run db:generate
```

## 🔌 API Endpoints

### Аутентификация
- `POST /api/auth/login` - вход
- `POST /api/auth/register` - регистрация
- `GET /api/auth/me` - текущий пользователь

### Офферы
- `GET /api/offers` - список офферов
- `POST /api/offers` - создать оффер
- `PUT /api/offers/:id` - обновить оффер
- `DELETE /api/offers/:id` - удалить оффер

### Трекинг
- `GET /api/track/:id` - переход по ссылке
- `POST /api/postback` - получение постбеков

### Статистика
- `GET /api/statistics` - общая статистика
- `GET /api/analytics` - детальная аналитика

## 🔒 Безопасность

### Переменные окружения
**Обязательные:**
- `JWT_SECRET` - ключ для токенов (256 бит)
- `SESSION_SECRET` - ключ для сессий
- `DATABASE_URL` - подключение к БД

**Для интеграций:**
- `SENDGRID_API_KEY` - отправка email
- `VOLUUM_TOKEN` - интеграция с Voluum
- `KEITARO_TOKEN` - интеграция с Keitaro
- `BINOM_TOKEN` - интеграция с Binom
- `REDTRACK_TOKEN` - интеграция с RedTrack

**Google Cloud (для Object Storage):**
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_STORAGE_BUCKET`
- `GOOGLE_APPLICATION_CREDENTIALS` - путь к JSON ключу

## 🚨 Антифрод система

### Функции
- Проверка IP адресов
- Анализ User-Agent
- Детекция ботов
- Геофильтрация
- Контроль частоты кликов

### Настройка
Настройки доступны в админпанели:
- Уровни защиты (low/medium/high)
- Белые/черные списки IP
- Правила фильтрации

## 📊 Интеграция с трекерами

### Поддерживаемые
- **Voluum** - полная интеграция
- **Keitaro** - постбеки и статистика  
- **Binom** - отслеживание конверсий
- **RedTrack** - аналитика трафика

### Настройка постбеков
URL для постбеков: `https://yourdomain.com/api/postback?token={click_id}&event={event_type}`

Параметры:
- `{click_id}` - идентификатор клика
- `{event_type}` - тип события (lead, sale, etc.)
- `{payout}` - сумма выплаты

## 🔧 Разработка

### Структура проекта
```
├── client/          # React фронтенд
├── server/          # Express бекенд  
├── shared/          # Общие типы и схемы
├── migrations/      # Миграции БД
├── public/          # Статические файлы
└── scripts/         # Утилиты и скрипты
```

### Команды
```bash
npm run dev          # Запуск разработки
npm run build        # Сборка проекта
npm run start        # Запуск продакшн
npm run db:push      # Применить миграции
npm run db:generate  # Создать миграцию
npm run test         # Запуск тестов
```

## 🐛 Отладка

### Логи
Логи сохраняются в консоли и включают:
- HTTP запросы с таймингами
- Ошибки базы данных
- WebSocket подключения
- Постбек события

### Частые проблемы
1. **Ошибка подключения к БД** - проверьте `DATABASE_URL`
2. **JWT ошибки** - убедитесь что `JWT_SECRET` установлен
3. **CORS ошибки** - настройте домены в конфигурации
4. **WebSocket не подключается** - проверьте firewall

## 📞 Поддержка

### Документация
- API документация: `/api-docs`
- Swagger UI: `/swagger`
- Схема БД: `shared/schema.ts`

### Контакты
При проблемах с деплоем проверьте:
1. Переменные окружения
2. Доступность базы данных
3. Права доступа к файлам
4. Версию Node.js (рекомендуется 18+)

---
**Платформа готова к продакшн использованию!** 🚀