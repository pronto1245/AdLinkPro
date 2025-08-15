#!/bin/bash

# 🚀 КОМАНДЫ ДЛЯ ДЕПЛОЯ AdLinkPro ЧЕРЕЗ ТЕРМИНАЛ

echo "🔧 Настройка PATH для Koyeb CLI..."
export PATH="/home/runner/.koyeb/bin:$PATH"

echo "📝 Проверка CLI инструментов..."
koyeb --version
netlify --version

echo ""
echo "🚀 KOYEB ДЕПЛОЙ (Backend):"
echo "============================="

# Создание Koyeb приложения и сервиса
echo "Создаем Koyeb сервис..."
koyeb service create \
  --name "adlinkpro-backend" \
  --app "adlinkpro" \
  --git github.com/YOUR_USERNAME/AdLinkPro \
  --git-branch main \
  --ports 8000:http \
  --routes /:8000 \
  --env NODE_ENV=production \
  --env PORT=8000 \
  --env "DATABASE_URL=postgresql://your_neon_connection_string" \
  --env "JWT_SECRET=your_custom_jwt_secret" \
  --env "SESSION_SECRET=your_custom_session_secret" \
  --instance-type micro \
  --regions fra

echo ""
echo "🌐 NETLIFY ДЕПЛОЙ (Frontend):"
echo "============================="

# Netlify деплой
echo "Авторизация в Netlify (откроется браузер)..."
netlify login

echo "Создание и деплой сайта..."
cd client
netlify init --force
netlify env:set VITE_API_BASE_URL https://adlinkpro.koyeb.app
netlify env:set NODE_VERSION 18
netlify deploy --build --prod
cd ..

echo ""
echo "✅ ГОТОВО!"
echo "Frontend: https://adlinkpro.netlify.app"
echo "Backend: https://adlinkpro.koyeb.app"
echo "Health: https://adlinkpro.koyeb.app/health"