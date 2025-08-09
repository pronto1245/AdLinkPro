# Инструкции по настройке

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
Система использует PostgreSQL. В Replit база данных уже настроена через `DATABASE_URL`.

### 3. Конфигурация секретов
Добавьте следующие секреты в Replit Secrets:

**Обязательные:**
- `DATABASE_URL` - URL базы данных PostgreSQL
- `JWT_SECRET` - секрет для JWT токенов
- `SESSION_SECRET` - секрет для сессий

**Для трекеров (опционально):**
- `KEITARO_ENDPOINT` - URL вашего Keitaro трекера
- `KEITARO_TOKEN` - API токен Keitaro
- `BINOM_ENDPOINT` - URL Binom трекера
- `BINOM_TOKEN` - API токен Binom

### 4. Запуск системы
```bash
npm run dev
```

## Структура проекта

```
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Конфигурация
│   ├── queue/             # Система очередей BullMQ
│   ├── routes.ts          # API роуты
│   └── storage.ts         # База данных
├── client/                # Frontend (React + TypeScript)
│   ├── src/pages/         # Страницы
│   ├── src/components/    # Компоненты
│   └── src/hooks/         # React хуки
├── shared/                # Общие типы и схемы
└── migrations/            # Миграции базы данных
```

## Основные компоненты

### 1. Система авторизации
- JWT токены
- Роли: super_admin, advertiser, affiliate, staff
- Защищенные роуты

### 2. Управление офферами
- CRUD операции
- Категории и геотаргетинг
- Drag & drop интерфейс

### 3. Система постбеков
- Автоматическая доставка
- Поддержка Keitaro, Binom, RedTrack, Voluum
- Retry логика

### 4. Антифрод система
- Hard/Soft уровни блокировки
- Политики по профилям
- Детальная статистика

### 5. Аналитика
- Реальное время
- Конверсии и статистика
- Geo и device данные

## API Endpoints

### Авторизация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий пользователь

### События
- `POST /api/v3/event` - создание события
- `POST /api/v3/postback/test` - тест постбека

### Очереди
- `GET /api/queue/stats` - статистика очередей

### Антифрод
- `GET /api/advertiser/antifraud/dashboard` - дашборд
- `POST /api/test-antifraud` - тест антифрода

## Тестирование

### Frontend тестирование событий
Доступно по адресам:
- `/admin/events` - для super_admin
- `/advertiser/events` - для advertiser
- `/affiliate/events` - для affiliate

### API тестирование
```bash
# Тест создания события
curl -X POST -H "Content-Type: application/json" \
  -d '{"type":"purchase","clickid":"test123","txid":"tx123","value":100}' \
  http://localhost:5000/api/v3/event

# Тест антифрода
curl -X POST -H "Content-Type: application/json" \
  -d '{"antifraudLevel":"hard","clickid":"test123"}' \
  http://localhost:5000/api/test-antifraud
```

## Развертывание

### В Replit
1. Клонируйте проект
2. Настройте секреты в Replit Secrets
3. Запустите через команду `npm run dev`
4. Используйте кнопку Deploy для публикации

### В продакшене
1. Установите все зависимости
2. Настройте переменные окружения
3. Запустите миграции: `npm run db:push`
4. Соберите frontend: `npm run build`
5. Запустите: `npm start`

## Мониторинг

### Статистика очередей
```bash
curl http://localhost:5000/api/queue/stats
```

### Логи
- Файлы логов: `logs/app.log`
- Console логи в development режиме
- Audit логи в базе данных

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь в корректности секретов
3. Проверьте статус внешних сервисов
4. Обратитесь к документации API