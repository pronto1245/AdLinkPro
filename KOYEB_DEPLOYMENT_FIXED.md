# 🚀 Исправленная конфигурация Koyeb для AdLinkPro

## ✅ Исправления сделаны:

### 1. **Порт настроен**: 8000 для production (Koyeb), 5000 для local
### 2. **Health check**: `/health` и `/api/health` endpoints активны  
### 3. **Dockerfile.koyeb**: Оптимизированный для Koyeb build
### 4. **koyeb.yaml**: Конфигурация деплоя

## Обязательные Environment Variables на Koyeb:

```env
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE
SESSION_SECRET=iP0q834n8AokwfuJRD445R1lVP6gH83i
NODE_ENV=production
PORT=8000
```

## Инструкции для исправления в Koyeb Dashboard:

### 1. **Environment Variables**
- Зайти в Koyeb Dashboard → adlinkpro service
- **Settings** → **Environment Variables**  
- Добавить переменные выше

### 2. **Build Settings**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: `8000`  
- **Health Check Path**: `/health`

### 3. **Redeploy**
- **Deploy** → **Redeploy** после изменения настроек

## Что должно работать после исправления:

✅ **https://adlinkpro.koyeb.app/** - загружается без белого экрана  
✅ **https://adlinkpro.koyeb.app/health** - возвращает `{"ok": true, "timestamp": "..."}`  
✅ **https://adlinkpro.koyeb.app/api/auth/me** - API работает  
✅ **Авторизация** - advertiser1/password123 входит успешно  

## Fallback план:

Если Koyeb продолжает проблемы:
- **Railway**: https://railway.app (более стабильная платформа)
- **Render**: https://render.com (бесплатный tier)
- **Vercel**: https://vercel.com (для full-stack приложений)

## Commit в GitHub:

После исправления настроек Koyeb, сделать commit исправлений:
```bash
git add .
git commit -m "🔧 Fix Koyeb deployment - port 8000, health check, Docker config"
git push origin main  
```

Koyeb автоматически подхватит изменения и переразвернет приложение.