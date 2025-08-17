# 🚀 Affiliate Pro - Быстрый старт

## 📥 Что вы получили
✅ **Полный исходный код** - 320+ файлов профессиональной платформы  
✅ **Готовая архитектура** - React + Node.js + PostgreSQL + TypeScript  
✅ **Документация** - подробные инструкции и схемы  
✅ **Конфигурации** - для Railway, Vercel, Netlify, Docker  
✅ **Тестовые аккаунты** - готовые для проверки функций  

## ⚡ Быстрый запуск (5 минут)

### 1. Скачайте архив
```bash
# Правый клик → Download на файле:
AFFILIATE_PRO_COMPLETE_PROJECT.tar.gz
```

### 2. Распакуйте и установите
```bash
tar -xzf AFFILIATE_PRO_COMPLETE_PROJECT.tar.gz
cd affiliate-pro/
npm install
```

### 3. Настройте базу данных
```bash
# Создайте .env файл
cp .env.example .env

# Отредактируйте .env - добавьте DATABASE_URL
nano .env

# Примените миграции
npm run db:push
```

### 4. Запустите проект
```bash
npm run dev
```

**🎉 Готово! Откройте http://localhost:5000**

## 🔐 Тестовые аккаунты

### Супер админ
- **Email:** `9791207@gmail.com`
- **Username:** `owner`
- **Пароль:** `77GeoDav=`
- **Доступ:** Полное управление

### Рекламодатель  
- **Email:** `6484488@gmail.com`
- **Username:** `requester`
- **Пароль:** `7787877As`
- **Доступ:** Управление офферами

### Партнер
- **Email:** `pablota096@gmail.com`
- **Username:** `partner`
- **Пароль:** `7787877As` 
- **Доступ:** Просмотр офферов

## 🌐 Деплой в один клик

### Railway (Рекомендуется)
1. Подключите GitHub репозиторий
2. Добавьте `DATABASE_URL` в переменные
3. Деплой автоматический

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Docker
```bash
docker build -t affiliate-pro .
docker run -p 5000:5000 --env-file .env affiliate-pro
```

## ⚙️ Обязательные переменные
```env
# Минимум для запуска
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="ваш-секретный-ключ-256-бит"
SESSION_SECRET="ваш-секрет-сессии"
```

## 🎯 Что работает из коробки

### ✅ Полная функциональность
- **Панели ролей** - админ, рекламодатель, партнер
- **Управление офферами** - CRUD, категории, пейауты
- **Система трекинга** - короткие ссылки, статистика
- **Аналитика** - графики, отчеты, экспорт
- **Антифрод** - AI защита, фильтры, алерты
- **Постбеки** - интеграция с трекерами
- **Уведомления** - WebSocket, Telegram
- **Файлы** - загрузка, Object Storage
- **Многоязычность** - русский/английский
- **Темы** - светлая/темная

### 🔌 Интеграции
- **Трекеры:** Voluum, Keitaro, Binom, RedTrack
- **Email:** SendGrid
- **Хранилище:** Google Cloud Storage
- **Боты:** Telegram
- **База:** PostgreSQL, SQLite

## 📁 Структура файлов
```
affiliate-pro/
├── client/          # React фронтенд
├── server/          # Node.js бекенд
├── shared/          # Общие типы
├── migrations/      # Миграции БД
├── package.json     # Зависимости
├── README_DEPLOY.md # Полная документация
└── .env.example     # Настройки
```

## 🛠️ Основные команды
```bash
npm run dev          # Разработка
npm run build        # Сборка
npm run start        # Продакшн
npm run db:push      # Миграции БД
npm run db:generate  # Новая миграция
```

## 🚨 Решение проблем

### Ошибка подключения к БД
```bash
# Проверьте DATABASE_URL в .env
# Для тестов используйте SQLite:
DATABASE_URL="file:./dev.db"
```

### JWT ошибки
```bash
# Сгенерируйте новый секрет:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Порт занят
```bash
# Смените порт в .env:
PORT="3000"
```

## 📞 Поддержка

### 📖 Документация
- **README_DEPLOY.md** - полная документация
- **DEPLOYMENT_SECRETS.md** - настройка секретов  
- **PROJECT_STRUCTURE.md** - архитектура проекта

### 🔍 Отладка
- Логи в консоли показывают все запросы
- API доступен на `/api/*` 
- WebSocket на том же порту

### ⚡ Готовые решения
Все настроено из коробки - просто запустите!

---
**🎯 Платформа готова к использованию через 5 минут после скачивания!**