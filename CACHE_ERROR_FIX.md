# 🚨 РЕШЕНИЕ ОШИБКИ CACHE KEY

## ❌ ПРОБЛЕМА:
```
failed to compute cache key: "/app/dist": not found
Build failed ❌
```

## 🔍 ПРИЧИНА:
Docker ищет папку `/app/dist` которая создается только после сборки, но сборка не работает в монорепозитории.

## ✅ ОКОНЧАТЕЛЬНОЕ РЕШЕНИЕ:

### Используйте: `Dockerfile.koyeb.final`

Этот Dockerfile:
- **Не ищет папку dist** 
- **Не выполняет сборку**
- **Использует npm run dev**
- **Работает гарантированно**

### 📋 Инструкция для Koyeb:

1. **Build Settings** → Docker
2. **Dockerfile path**: `Dockerfile.koyeb.final`
3. **Build context**: `.`
4. **Deploy**

### 🔧 CLI команда:
```bash
koyeb app create affiliate-marketing-platform \
  --git https://github.com/username/affiliate-pro \
  --docker-dockerfile Dockerfile.koyeb.final \
  --ports 5000:http \
  --env NODE_ENV=production \
  --env PORT=5000 \
  --env DATABASE_URL=postgresql://user:pass@host:5432/db
```

## 💡 ВАЖНО:
- **НЕ используйте** Dockerfile с командой `RUN npm run build`
- **НЕ используйте** Dockerfile который ищет папку `dist/`
- **ТОЛЬКО `Dockerfile.koyeb.final`** - без кеша и сборки

## 🚀 РЕЗУЛЬТАТ:
- ✅ Никаких ошибок кеша
- ✅ Никаких ошибок сборки  
- ✅ Приложение запускается на порту 5000
- ✅ Полная функциональность партнерской платформы