# 🌐 NETLIFY ДЕПЛОЙ - Готовые команды

## 📋 Команды для твоего терминала:

```bash
# Перейди в папку client проекта AdLinkPro
cd client

# Инициализация Netlify сайта
netlify init --force

# Настройка environment variables
netlify env:set VITE_API_BASE_URL https://adlinkpro.koyeb.app
netlify env:set NODE_VERSION 18

# Production деплой
netlify deploy --build --prod
```

## 🔧 Если возникают ошибки:

### Ошибка авторизации:
```bash
netlify login
```

### Ошибка сборки:
```bash
# Сначала локальная сборка
npm install
npm run build

# Потом деплой
netlify deploy --dir=dist --prod
```

### Проблемы с Node.js версией:
```bash
netlify env:set NODE_VERSION 18
netlify env:set NPM_VERSION 8
```

## ✅ После успешного деплоя:

- **Frontend URL**: https://adlinkpro.netlify.app
- **Подключение к Backend**: https://adlinkpro.koyeb.app
- **Автоматический HTTPS**: включен
- **CDN**: глобальная дистрибуция

## 🔍 Проверка работы:

1. Открой: https://adlinkpro.netlify.app
2. Логин: `advertiser1` / `password123`
3. Проверь загрузку dashboard
4. Убедись что API вызовы работают

## 📊 Build настройки Netlify:

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "client/dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Все готово для деплоя frontend на Netlify!**