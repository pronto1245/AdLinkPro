#!/bin/bash

# 🍎 Простой деплой AdLinkPro с Mac

echo "🚀 Деплой AdLinkPro с твоего Mac..."

# Проверка CLI инструментов
echo "🔧 Проверка CLI..."
if ! command -v koyeb &> /dev/null; then
    echo "❌ Koyeb CLI не найден. Установи:"
    echo "curl -L https://github.com/koyeb/koyeb-cli/releases/latest/download/koyeb-darwin-amd64.tar.gz | tar xz"
    echo "sudo mv koyeb /usr/local/bin/"
    exit 1
fi

if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI не найден. Установи:"
    echo "npm install -g netlify-cli"
    exit 1
fi

echo "✅ CLI инструменты готовы"

# Koyeb деплой
echo "📡 Деплой backend на Koyeb..."
koyeb service create \
  --name "adlinkpro-backend" \
  --app "adlinkpro" \
  --git github.com/YOUR_USERNAME/AdLinkPro \
  --git-branch main \
  --ports 8000:http \
  --env NODE_ENV=production \
  --env PORT=8000

# Netlify деплой
echo "🌐 Деплой frontend на Netlify..."
if [ -d "client" ]; then
    cd client
    netlify init --force
    netlify env:set VITE_API_BASE_URL https://adlinkpro.koyeb.app
    netlify deploy --build --prod
    cd ..
else
    echo "❌ Папка client не найдена. Убедись что ты в корне проекта AdLinkPro"
    exit 1
fi

echo "✅ Деплой завершен!"
echo "Frontend: https://adlinkpro.netlify.app"
echo "Backend: https://adlinkpro.koyeb.app"