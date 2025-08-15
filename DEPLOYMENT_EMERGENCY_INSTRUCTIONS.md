# 🚨 Инструкции для экстренного восстановления работы

## Текущая проблема
**Backend на Koyeb не работает** - все URL показывают "No service is active (yet)"
**Frontend на Netlify работает**, но не может авторизовать пользователей

## ✅ РЕШЕНИЕ №1: Перезапуск Koyeb сервиса

### Войти в панель Koyeb:
1. Зайти на koyeb.com и войти в аккаунт
2. Найти сервис affiliate-pro или adlinkpro-backend
3. Нажать **Restart** или **Redeploy** 
4. Убедиться что переменные среды настроены:
   - `DATABASE_URL` = строка подключения к Neon
   - `JWT_SECRET` = любой случайный 32+ символьный ключ
   - `SESSION_SECRET` = любой случайный 32+ символьный ключ
   - `PORT` = 5000

## ✅ РЕШЕНИЕ №2: Альтернативный деплой на Railway

### Быстрый деплой:
1. Зайти на railway.app 
2. "New Project" → "Deploy from GitHub repo"
3. Загрузить архив `AFFILIATE_PRO_BACKEND_FIXED.tar.gz`
4. Настроить переменные среды:
   ```
   DATABASE_URL=postgresql://[YOUR_NEON_CONNECTION_STRING]
   JWT_SECRET=your-jwt-secret-32-characters-minimum
   SESSION_SECRET=your-session-secret-32-characters  
   PORT=5000
   NODE_ENV=production
   ```
5. Deploy - получить URL (например: `https://affiliate-pro-production.up.railway.app`)

### Обновить Frontend:
6. В Netlify панели зайти в Environment Variables
7. Установить: `VITE_API_BASE_URL=https://your-railway-url.up.railway.app`
8. Trigger Redeploy

## ✅ РЕШЕНИЕ №3: Локальный тест

Локально все работает на порту 5000:
```bash
npm run dev
```
Доступ: http://localhost:5000

**Тестовые аккаунты:**
- superadmin / password123
- advertiser1 / password123  
- test_affiliate / password123

## 🔧 Настроенные исправления

В этом архиве уже исправлено:
1. ✅ API URL конфигурация (`client/.env.production`)
2. ✅ Dynamic API baseURL (`client/src/lib/queryClient.ts`)
3. ✅ Netlify redirects (`client/public/_redirects`)
4. ✅ Railway deployment config (`railway.json`, `Dockerfile.railway`)

## Проверка статуса

После деплоя проверить:
```bash
curl https://your-backend-url.com/health
curl https://your-backend-url.com/api/auth/me
```

Должно вернуть JSON вместо HTML ошибки Koyeb.

## 📞 Поддержка
Если ни одно решение не работает - проблема может быть в:
- Базе данных Neon (проверить подключение)
- Переменных среды (JWT_SECRET, DATABASE_URL)
- DNS настройках домена