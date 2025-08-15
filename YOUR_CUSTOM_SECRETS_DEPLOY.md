# 🔐 ДЕПЛОЙ С ТВОИМИ СЕКРЕТАМИ - AdLinkPro

## ✅ Обновлено: используем твои собственные JWT_SECRET и SESSION_SECRET

---

## 🚀 KOYEB ДЕПЛОЙ С ТВОИМИ СЕКРЕТАМИ:

### Environment Variables для Koyeb:
```env
DATABASE_URL=<your_neon_postgresql_connection_string>
JWT_SECRET=<твой_собственный_JWT_SECRET>
SESSION_SECRET=<твой_собственный_SESSION_SECRET>
NODE_ENV=production
PORT=8000
```

### Koyeb Web UI:
1. Открой: https://app.koyeb.com/
2. Create Service → Deploy from GitHub
3. Repository: `AdLinkPro`
4. Build Settings:
   - Build command: `npm install && npm run build`
   - Run command: `npm start`
   - Port: `8000`
   - Health check: `/health`
5. **Environment Variables** (добавь в Koyeb UI):
   - `DATABASE_URL` = твоя Neon connection string
   - `JWT_SECRET` = твой собственный JWT secret
   - `SESSION_SECRET` = твой собственный session secret  
   - `NODE_ENV` = production
   - `PORT` = 8000

---

## 🌐 NETLIFY ДЕПЛОЙ:

### Environment Variables для Netlify:
```env
VITE_API_BASE_URL=https://adlinkpro.koyeb.app
NODE_VERSION=18
```

### Netlify Web UI:
1. Открой: https://app.netlify.com/
2. New site from Git → GitHub → AdLinkPro
3. Build Settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. **Environment Variables** (добавь в Netlify UI):
   - `VITE_API_BASE_URL` = https://adlinkpro.koyeb.app
   - `NODE_VERSION` = 18

---

## 🔍 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ:

### Backend Tests:
```bash
# Health check
curl https://adlinkpro.koyeb.app/health

# API Login test
curl https://adlinkpro.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"advertiser1","password":"password123"}'
```

### Frontend Test:
1. Открой: https://adlinkpro.netlify.app/
2. Логин: `advertiser1` / `password123`
3. Проверь что dashboard загружается
4. Убедись что API вызовы работают (Network tab)

---

## ⚡ ВАЖНО:

### Безопасность твоих секретов:
- ✅ JWT_SECRET - используется для подписи токенов
- ✅ SESSION_SECRET - используется для сессий Express
- ✅ Оба секрета должны быть длинными и случайными
- ✅ Никогда не публикуй их в GitHub

### Production URLs после деплоя:
- **Frontend**: https://adlinkpro.netlify.app
- **Backend**: https://adlinkpro.koyeb.app  
- **Health**: https://adlinkpro.koyeb.app/health

---

## 🎯 READY TO DEPLOY:

**Все готово с твоими собственными секретами!**

1. Koyeb: добавь свои environment variables
2. Netlify: стандартные настройки
3. Проверь работу после деплоя

**Production-ready affiliate platform с твоей собственной безопасностью!**