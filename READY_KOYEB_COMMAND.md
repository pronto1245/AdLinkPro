# 🚀 ГОТОВАЯ КОМАНДА KOYEB ДЕПЛОЯ

## Замени эти значения на свои и выполни:

```bash
koyeb service create \
  --name "adlinkpro-backend" \
  --app "adlinkpro" \
  --git github.com/ТВОЙ_GITHUB_USERNAME/AdLinkPro \
  --git-branch main \
  --ports 8000:http \
  --routes /:8000 \
  --env NODE_ENV=production \
  --env PORT=8000 \
  --env "DATABASE_URL=postgresql://ТВОЙ_NEON_USER:ТВОЙ_NEON_PASSWORD@ТВОЙ_NEON_HOST/ТВОЙ_NEON_DB?sslmode=require" \
  --env "JWT_SECRET=ТВОЙ_СОБСТВЕННЫЙ_JWT_SECRET" \
  --env "SESSION_SECRET=ТВОЙ_СОБСТВЕННЫЙ_SESSION_SECRET" \
  --instance-type micro \
  --regions fra
```

## 📝 ЧТО НУЖНО ЗАМЕНИТЬ:

1. **ТВОЙ_GITHUB_USERNAME** - твой GitHub username
2. **DATABASE_URL** - полная строка подключения к Neon PostgreSQL
3. **JWT_SECRET** - твой собственный JWT secret (который ты уже настроил)
4. **SESSION_SECRET** - твой собственный session secret (который ты уже настроил)

## 🔍 Пример DATABASE_URL:
```
postgresql://username:password@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## ⚡ После выполнения команды:
- Backend будет доступен на: https://adlinkpro.koyeb.app
- Health check: https://adlinkpro.koyeb.app/health
- API endpoints: https://adlinkpro.koyeb.app/api/*

## 🌐 Следующий шаг - Netlify:
```bash
cd client
netlify init
netlify env:set VITE_API_BASE_URL https://adlinkpro.koyeb.app
netlify deploy --build --prod
```