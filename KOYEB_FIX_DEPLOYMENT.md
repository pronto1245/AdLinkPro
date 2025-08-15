# 🔧 Исправление деплоя AdLinkPro на Koyeb

## Текущая проблема
- **Status**: 404 - No active service
- **Причина**: Сервис не развернут или не запущен корректно
- **URL**: https://adlinkpro.koyeb.app/

## Пошаговое исправление

### 1. Проверить статус в Koyeb Dashboard
- Зайти на **koyeb.com** → **Dashboard**  
- Найти проект **adlinkpro**
- Проверить статус сервиса и деплоя

### 2. Критичные настройки для исправления

#### Environment Variables (обязательно добавить):
```env
DATABASE_URL=<ваш_neon_postgresql_url>
JWT_SECRET=hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE
SESSION_SECRET=iP0q834n8AokwfuJRD445R1lVP6gH83i
NODE_ENV=production
PORT=8000
```

#### Build Configuration:
```bash
Build Command: npm install && npm run build
Start Command: npm start  
Port: 8000
Health Check Path: /api/health
```

### 3. Dockerfile для Koyeb (если нужен)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### 4. Проверка package.json scripts
Убедиться что есть:
```json
{
  "scripts": {
    "start": "NODE_ENV=production tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build", 
    "build:server": "tsc"
  }
}
```

### 5. Исправление server/index.ts для Koyeb
Убедиться что сервер слушает правильный порт:
```javascript
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6. Health Check Endpoint (добавить в server/routes.ts)
```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});
```

## Альтернативное решение

Если Koyeb продолжает проблемы:
1. **Railway** - более стабильная платформа
2. **Render** - хорошая альтернатива  
3. **Vercel** - для full-stack приложений

## Диагностика
После исправления проверить:
- ✅ https://adlinkpro.koyeb.app/ загружается
- ✅ https://adlinkpro.koyeb.app/api/health возвращает 200
- ✅ Авторизация работает с тестовыми данными