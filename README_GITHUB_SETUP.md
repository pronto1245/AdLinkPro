# GitHub Integration Setup Guide

## Шаг 1: Создание GitHub репозитория

1. Создайте новый приватный репозиторий на GitHub
2. Назовите его `affiliate-pro` или `adlink-pro`
3. Добавьте описание: "Affiliate Marketing Platform with Anti-Fraud System"

## Шаг 2: Загрузка проекта

```bash
# В корне проекта выполните:
git init
git add .
git commit -m "Initial commit: Complete affiliate marketing platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/affiliate-pro.git
git push -u origin main
```

## Шаг 3: Настройка GitHub Secrets

В настройках репозитория (Settings → Secrets and variables → Actions) добавьте:

### Для Netlify Frontend:
- `NETLIFY_AUTH_TOKEN` - токен из Netlify аккаунта
- `NETLIFY_SITE_ID` - ID сайта из Netlify
- `API_BASE_URL` - URL вашего backend (например: https://affiliate-pro.up.railway.app)

### Для Railway Backend:
- `RAILWAY_TOKEN` - токен из Railway аккаунта
- `DATABASE_URL` - строка подключения к Neon PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (32+ символа)
- `SESSION_SECRET` - секретный ключ для сессий (32+ символа)

## Шаг 4: Подключение платформ

### Netlify:
1. Зайти в Netlify Dashboard
2. "New site from Git" → выбрать GitHub репозиторий
3. Build settings:
   - Build command: `npm run build:client`
   - Publish directory: `client/dist`
4. В Environment variables добавить `VITE_API_BASE_URL`

### Railway:
1. Зайти в Railway Dashboard  
2. "New Project" → "Deploy from GitHub repo"
3. Выбрать ваш репозиторий
4. Настроить переменные среды
5. Railway автоматически определит Node.js проект

## Шаг 5: Автодеплой

После настройки каждый push в main ветку будет:
1. Автоматически собирать проект
2. Тестировать сборку
3. Деплоить frontend на Netlify
4. Деплоить backend на Railway

## Шаг 6: Приглашение коллаборатора

1. Settings → Manage access → Invite a collaborator
2. Добавьте мой GitHub username для прямых правок

## Преимущества:

- ✅ **Автоматический деплой** при каждом изменении
- ✅ **Версионирование** всех изменений
- ✅ **Rollback** к любой предыдущей версии
- ✅ **CI/CD pipeline** с автотестами
- ✅ **Совместная разработка** через pull requests
- ✅ **Защищенные секреты** в GitHub Secrets

После настройки любые изменения в коде будут автоматически применяться к продакшен версии платформы.