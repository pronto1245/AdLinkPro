# 🚀 ФИНАЛЬНЫЙ ДЕПЛОЙ - Готовые команды

## ✅ CLI инструменты установлены:
- Koyeb CLI: `/home/runner/.koyeb/bin/koyeb`
- Netlify CLI: `netlify` (глобально)

---

## 🎯 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА KOYEB:

### Koyeb Service через CLI:
```bash
# Экспорт PATH для Koyeb CLI
export PATH="/home/runner/.koyeb/bin:$PATH"

# Создание сервиса
koyeb service create \
  --name "adlinkpro-backend" \
  --app "adlinkpro" \
  --git github.com/YOUR_USERNAME/AdLinkPro \
  --git-branch main \
  --ports 8000:http \
  --routes /:8000 \
  --env NODE_ENV=production \
  --env PORT=8000 \
  --env DATABASE_URL="your_neon_connection_string" \
  --env JWT_SECRET="hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE" \
  --env SESSION_SECRET="iP0q834n8AokwfuJRD445R1lVP6gH83i" \
  --instance-type micro \
  --regions fra
```

---

## 🎯 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА NETLIFY:

### Netlify Deploy через CLI:
```bash
# Авторизация в Netlify
netlify login

# Создание сайта
netlify init

# Настройка build
netlify link

# Деплой
netlify deploy --build --prod
```

---

## 📋 WEB UI ДЕПЛОЙ (рекомендуется):

### KOYEB:
1. Открой: https://app.koyeb.com/
2. Create Service → GitHub → AdLinkPro
3. Settings:
   - Port: 8000
   - Health check: /health
   - Instance: Micro (free)
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://your_neon_connection_string
   JWT_SECRET=hfxKEyw7TUYpimDwqDXbBMXxTXGGh5zE
   SESSION_SECRET=iP0q834n8AokwfuJRD445R1lVP6gH83i
   NODE_ENV=production
   PORT=8000
   ```

### NETLIFY:
1. Открой: https://app.netlify.com/
2. New site from Git → GitHub → AdLinkPro  
3. Build settings:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```
4. Environment Variables:
   ```
   VITE_API_BASE_URL=https://adlinkpro.koyeb.app
   NODE_VERSION=18
   ```

---

## 🔍 ПРОВЕРКА ДЕПЛОЯ:

### После успешного деплоя:
```bash
# Проверка backend
curl https://adlinkpro.koyeb.app/health

# Проверка API
curl https://adlinkpro.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"advertiser1","password":"password123"}'

# Проверка frontend
curl https://adlinkpro.netlify.app/
```

### Тест в браузере:
1. Открой: https://adlinkpro.netlify.app/
2. Логин: `advertiser1` / `password123`
3. Проверь dashboard и API calls
4. Убедись что WebSocket работает

---

## ⚡ БЫСТРЫЙ СТАРТ:

**Самый простой способ - WEB UI:**
1. Koyeb: https://app.koyeb.com/ 
2. Netlify: https://app.netlify.com/
3. Просто следуй инструкциям выше

**Результат: Production-ready affiliate platform на современном serverless стеке!**