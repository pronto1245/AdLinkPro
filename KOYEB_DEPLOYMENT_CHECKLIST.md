# ✅ Koyeb Deployment Checklist - Порт 8000

## 🎯 Конфигурация Koyeb (готова):

### Service Settings:
- **App Name**: `adlinkpro`
- **Service Name**: `adlinkpro-backend`
- **Port**: `8000` ✅
- **Health Check**: `/health` endpoint ✅
- **Region**: Frankfurt (fra)

### Environment Variables (добавить в Koyeb UI):
```env
DATABASE_URL=<your_neon_postgresql_connection_string>
JWT_SECRET=hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE
SESSION_SECRET=iP0q834n8AokwfuJRD445R1lVP6gH83i
NODE_ENV=production
PORT=8000
```

### Build & Deploy Commands:
- **Build**: `npm install && npm run build`
- **Start**: `npm start`

## 🎯 Netlify Deployment (готова):

### Build Settings:
- **Base Directory**: `client`
- **Build Command**: `npm run build` 
- **Publish Directory**: `client/dist`

### Environment Variables (добавить в Netlify UI):
```env
VITE_API_BASE_URL=https://adlinkpro.koyeb.app
NODE_VERSION=18
```

## 🔄 Проверка работы:

### Local Development (работает):
```bash
curl http://localhost:5000/health
# ✅ {"ok":true,"timestamp":"2025-08-15T10:35:14.783Z"}
```

### После деплоя проверить:
```bash
# Koyeb Backend
curl https://adlinkpro.koyeb.app/health
# Должен вернуть: {"ok": true, "timestamp": "..."}

# Koyeb API
curl https://adlinkpro.koyeb.app/api/advertiser/dashboard-metrics
# Должен вернуть JSON с метриками

# Netlify Frontend  
curl https://adlinkpro.netlify.app/
# Должен вернуть HTML страницу
```

## 📋 Последовательность деплоя:

1. **Koyeb (первым)**:
   - Create new Web Service
   - Connect GitHub: AdLinkPro repository
   - Set Environment Variables
   - Deploy и дождаться "Running" статуса
   
2. **Netlify (вторым)**:
   - New site from Git
   - Connect GitHub: AdLinkPro repository  
   - Set Build settings и Environment Variables
   - Deploy и дождаться "Published" статуса

3. **Проверка интеграции**:
   - Открыть Netlify URL
   - Войти: `advertiser1` / `password123`
   - Проверить что API запросы идут на Koyeb
   - Убедиться что WebSocket работает

## 🚨 Важные настройки:

- **CORS**: Netlify домен добавлен в allowedOrigins ✅
- **WebSocket**: Динамический URL настроен ✅  
- **API Endpoints**: Все необходимые endpoints добавлены ✅
- **Database**: Neon PostgreSQL connection готов ✅

Все готово для production деплоя!