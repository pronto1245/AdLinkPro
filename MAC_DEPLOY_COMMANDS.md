# 🍎 ДЕПЛОЙ С ТВОЕГО MAC - AdLinkPro

## 🚀 КОМАНДЫ ДЛЯ ТВОЕГО ТЕРМИНАЛА:

### **1. Установка CLI инструментов на Mac:**
```bash
# Koyeb CLI
curl -L https://github.com/koyeb/koyeb-cli/releases/latest/download/koyeb-darwin-amd64.tar.gz | tar xz
sudo mv koyeb /usr/local/bin/

# Netlify CLI
npm install -g netlify-cli
```

### **2. Проверка установки:**
```bash
koyeb --version
netlify --version
```

### **3. KOYEB ДЕПЛОЙ (Backend):**
```bash
# Авторизация в Koyeb (нужен API token)
koyeb auth login

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
  --env "DATABASE_URL=your_neon_connection_string" \
  --env "JWT_SECRET=your_custom_jwt_secret" \
  --env "SESSION_SECRET=your_custom_session_secret" \
  --instance-type micro \
  --regions fra
```

### **4. NETLIFY ДЕПЛОЙ (Frontend):**
```bash
# Авторизация в Netlify
netlify login

# Клонирование репозитория (если еще не сделано)
git clone https://github.com/YOUR_USERNAME/AdLinkPro.git
cd AdLinkPro

# Деплой frontend
cd client
netlify init
netlify env:set VITE_API_BASE_URL https://adlinkpro.koyeb.app
netlify env:set NODE_VERSION 18
netlify deploy --build --prod
```

---

## ⚡ АЛЬТЕРНАТИВА - WEB UI (проще):

### **Если CLI вызывает проблемы, используй Web интерфейс:**

**KOYEB:**
1. Открой: https://app.koyeb.com/
2. Create Service → GitHub → AdLinkPro
3. Настрой Environment Variables

**NETLIFY:**
1. Открой: https://app.netlify.com/
2. New site from Git → AdLinkPro
3. Build settings: client/dist

---

## 🔑 ВАЖНЫЕ ПЕРЕМЕННЫЕ:

### **Для KOYEB Environment Variables:**
```
DATABASE_URL=<твоя_neon_connection_string>
JWT_SECRET=<твой_jwt_secret>
SESSION_SECRET=<твой_session_secret>
NODE_ENV=production
PORT=8000
```

### **Для NETLIFY Environment Variables:**
```
VITE_API_BASE_URL=https://adlinkpro.koyeb.app
NODE_VERSION=18
```

---

## 📍 РЕЗУЛЬТАТ:
- **Frontend**: https://adlinkpro.netlify.app
- **Backend**: https://adlinkpro.koyeb.app
- **Health**: https://adlinkpro.koyeb.app/health