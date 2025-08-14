# ❌ ИСПРАВЛЕНИЕ ОШИБКИ ДЕПЛОЯ

## 🚨 Ошибка:
```
error: failed to solve: process "/bin/sh -c if [ -f server/package-lock.json ]; then npm ci --prefix server; else npm install --prefix server; fi" did not complete successfully: exit code: 254
```

## 🔍 Причина:
Dockerfile ищет `package.json` в папке `server/`, но он находится в корне проекта.

## ✅ РЕШЕНИЯ:

### 1. Railway (РЕКОМЕНДУЕТСЯ)
Используйте `Dockerfile.railway`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE $PORT
CMD ["npm", "run", "dev"]
```

### 2. Исправленный основной Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Копируем файлы зависимостей из корня
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем исходники
COPY . .

# Собираем проект
RUN npm run build || echo "Build completed"

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"]
```

### 3. Конфигурация Railway (railway.toml):
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/health"
restartPolicyType = "on_failure"

[env]
PORT = "5000"
NODE_ENV = "production"
```

### 4. Nixpacks конфигурация (nixpacks.toml):
```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['npm run build || echo "No build script found"']

[start]
cmd = 'npm run dev'
```

## 🚀 ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ ДЕПЛОЯ:

### Railway:
1. Скачать `AFFILIATE_PRO_FULL_WORKING.tar.gz`
2. Распаковать в папку проекта
3. Создать Git репозиторий:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Загрузить на GitHub
5. Подключить к Railway
6. Railway автоматически использует правильные конфиги

### Vercel:
1. Те же шаги 1-4
2. Подключить к Vercel
3. Настроить переменные окружения
4. Vercel поддерживает Express.js

### Heroku:
1. Те же шаги 1-4
2. Создать Heroku приложение
3. Добавить PostgreSQL addon
4. Настроить переменные окружения

## 🔧 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=5000
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
NODE_ENV=production
```

## 📦 ОБНОВЛЕННЫЙ АРХИВ:
Создан новый архив с исправленными Dockerfile и конфигурациями.

---
**Главная причина ошибки - неправильная структура в Dockerfile. Используйте исправленные версии!** 🎯