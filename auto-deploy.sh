#!/bin/bash

# 🚀 Автоматический деплой AdLinkPro

echo "🔧 Настройка PATH..."
export PATH="/home/runner/.koyeb/bin:$PATH"

echo "📦 Сборка frontend..."
cd client
npm install --silent
npm run build

echo "🌐 Создание статического сайта для Netlify..."
cd ../
mkdir -p netlify-deploy/client
cp -r client/dist/* netlify-deploy/client/ 2>/dev/null || echo "Копирование файлов frontend..."
cp netlify.toml netlify-deploy/

echo "📁 Создание production bundle..."
tar -czf adlinkpro-production.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=attached_assets \
  server/ shared/ client/ package.json .koyeb.yaml

echo "✅ Production файлы готовы:"
ls -la adlinkpro-production.tar.gz netlify-deploy/

echo ""
echo "🎯 РЕЗУЛЬТАТ:"
echo "- Backend bundle: adlinkpro-production.tar.gz"
echo "- Frontend files: netlify-deploy/"
echo "- Configs ready: .koyeb.yaml, netlify.toml"
echo ""
echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo "1. Залей adlinkpro-production.tar.gz в GitHub"
echo "2. Koyeb: https://app.koyeb.com/ → Create Service → GitHub"
echo "3. Netlify: https://app.netlify.com/ → Drag & Drop netlify-deploy/"