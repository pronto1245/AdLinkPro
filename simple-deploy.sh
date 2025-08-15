#!/bin/bash

# 🎯 ПРОСТОЙ ДЕПЛОЙ - Одной командой

echo "🚀 Запуск деплоя AdLinkPro..."

# Настройка PATH
export PATH="/home/runner/.koyeb/bin:$PATH"

# Koyeb деплой
echo "📡 Деплой backend на Koyeb..."
koyeb service create \
  --name "adlinkpro" \
  --git github.com/YOUR_USERNAME/AdLinkPro \
  --ports 8000:http \
  --env NODE_ENV=production \
  --env PORT=8000

# Netlify деплой  
echo "🌐 Деплой frontend на Netlify..."
cd client && netlify deploy --build --prod

echo "✅ Деплой завершен!"