# 🚀 ДЕПЛОЙ НА KOYEB

Koyeb - современная платформа для деплоя приложений с автоматическим масштабированием и встроенной PostgreSQL.

## ✅ ПРЕИМУЩЕСТВА KOYEB:

- 🔥 Простая настройка из Git репозитория
- 🗄️ Встроенная PostgreSQL база данных  
- 🌍 Глобальная сеть (edge locations)
- 💰 Бесплатный план до 512MB RAM
- ⚡ Автоматическое масштабирование
- 🔒 SSL сертификаты

## 📋 ПОШАГОВЫЙ ДЕПЛОЙ:

### 1. Подготовка репозитория
```bash
# Скачать архив AFFILIATE_PRO_DEPLOY_READY.tar.gz
tar -xzf AFFILIATE_PRO_DEPLOY_READY.tar.gz
cd affiliate-pro/

# Создать Git репозиторий
git init
git add .
git commit -m "Initial commit for Koyeb deployment"

# Загрузить на GitHub
git remote add origin https://github.com/username/affiliate-pro.git
git push -u origin main
```

### 2. Создание приложения в Koyeb

**А. Через веб-интерфейс:**
1. Зайти на https://app.koyeb.com
2. Create App → Deploy from Git
3. Подключить GitHub репозиторий
4. Выбрать репозиторий с проектом

**Б. Через CLI:**
```bash
# Установить Koyeb CLI
npm install -g @koyeb/cli
koyeb auth login

# Создать приложение (используем упрощенный Dockerfile)
koyeb app create affiliate-marketing-platform \
  --git https://github.com/username/affiliate-pro \
  --docker-dockerfile Dockerfile.koyeb.simple \
  --ports 8000:http \
  --env NODE_ENV=production \
  --env PORT=8000
```

## ⚠️ РЕШЕНИЕ ОШИБКИ BUILD:

Если получаете ошибку `exit code: 2` при сборке:

**Причина:** Стандартная команда `npm run build` может падать в Docker окружении.

**РЕШЕНИЕ 1 - Использовать упрощенный Dockerfile:**
В Koyeb Dashboard выбрать файл: `Dockerfile.koyeb.simple`

**РЕШЕНИЕ 2 - Настройка через веб-интерфейс:**
1. Build settings → Docker
2. Dockerfile path: `Dockerfile.koyeb.simple` 
3. Build context: `.` (корень проекта)

**РЕШЕНИЕ 3 - Отключить build:**
Упрощенный Dockerfile запускает приложение с `tsx` напрямую, без сборки.

### 3. Настройка базы данных

**PostgreSQL в Koyeb:**
```bash
# Создать PostgreSQL сервис
koyeb service create postgres-db \
  --app affiliate-marketing-platform \
  --docker postgres:15-alpine \
  --env POSTGRES_DB=affiliate_db \
  --env POSTGRES_USER=affiliate_user \
  --env POSTGRES_PASSWORD=secure_password \
  --ports 5432:tcp
```

### 4. Переменные окружения

Добавить в Koyeb Dashboard или через CLI:

```bash
koyeb service update app \
  --env DATABASE_URL="postgresql://affiliate_user:secure_password@postgres-db:5432/affiliate_db" \
  --env JWT_SECRET="your-jwt-secret-here" \
  --env SESSION_SECRET="your-session-secret-here" \
  --env SENDGRID_API_KEY="" \
  --env NODE_ENV="production"
```

**Обязательные переменные:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key  
SESSION_SECRET=your-session-secret
PORT=8000
```

**Опциональные переменные:**
```
SENDGRID_API_KEY=your-sendgrid-key
VOLUUM_TOKEN=your-voluum-token
KEITARO_TOKEN=your-keitaro-token
NODE_ENV=production
```

### 5. Проверка деплоя

```bash
# Проверить статус
koyeb app list
koyeb service list --app affiliate-marketing-platform

# Посмотреть логи
koyeb service logs app --app affiliate-marketing-platform

# Получить URL приложения
koyeb service get app --app affiliate-marketing-platform
```

## 🔧 НАСТРОЙКА ДОМЕНА

**Кастомный домен:**
1. В Koyeb Dashboard → Settings → Domains
2. Добавить домен: `your-domain.com`
3. Настроить DNS записи:
   ```
   Type: CNAME
   Name: www
   Value: your-app.koyeb.app
   ```

## ⚡ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ

Настроить webhook для автоматического деплоя при push в main:

1. GitHub → Settings → Webhooks
2. Payload URL: `https://app.koyeb.com/webhook/github`
3. Content type: `application/json`
4. Events: `push`

## 📊 МОНИТОРИНГ

**Логи в реальном времени:**
```bash
koyeb service logs app --app affiliate-marketing-platform --follow
```

**Метрики:**
- CPU, память, сетевой трафик
- Время отклика
- Статусы HTTP запросов

## 🔄 МИГРАЦИИ

После первого деплоя выполнить:
```bash
# Подключиться к базе данных
koyeb service exec app --app affiliate-marketing-platform -- npm run db:push

# Или через веб-терминал в Koyeb Dashboard
```

## 💰 СТОИМОСТЬ

**Бесплатный план:**
- 512 MB RAM
- 0.1 vCPU
- 2.5 GB SSD
- Включена PostgreSQL

**Платные планы от $7/месяц:**
- Больше ресурсов
- Автоскейлинг
- Приоритетная поддержка

## 🎯 РЕЗУЛЬТАТ

После успешного деплоя получите:
- ✅ Полнофункциональную партнерскую платформу
- ✅ PostgreSQL базу данных
- ✅ SSL сертификат
- ✅ Глобальный CDN
- ✅ Автоматические бэкапы

**URL приложения:** `https://your-app-name.koyeb.app`

## 🔧 ТЕСТИРОВАНИЕ

```bash
# Проверить здоровье приложения
curl https://your-app.koyeb.app/health

# Проверить API
curl https://your-app.koyeb.app/api/health

# Авторизация
curl -X POST https://your-app.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

**Koyeb идеально подходит для продакшн деплоя партнерских платформ благодаря встроенной PostgreSQL и глобальной сети!**