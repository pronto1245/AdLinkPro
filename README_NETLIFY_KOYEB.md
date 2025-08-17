# 🚀 Руководство по деплою: Netlify + Koyeb

Полное руководство по развертыванию полнофункциональной партнерской платформы AdLinkPro с использованием Netlify для фронтенда и Koyeb для бэкенда.

## 📋 Оглавление

- [🎯 Обзор архитектуры](#-обзор-архитектуры)
- [⚙️ Автоматическая настройка](#%EF%B8%8F-автоматическая-настройка)
- [🔧 Ручная настройка](#-ручная-настройка)
- [🌐 Настройка Netlify](#-настройка-netlify)
- [☁️ Настройка Koyeb](#%EF%B8%8F-настройка-koyeb)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🐛 Troubleshooting](#-troubleshooting)
- [📊 Мониторинг](#-мониторинг)

## 🎯 Обзор архитектуры

### Компоненты системы:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   ПОЛЬЗОВАТЕЛЬ  │───▶│     NETLIFY     │───▶│     KOYEB       │
│                 │    │   (Frontend)    │    │   (Backend)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────┐        ┌─────────────┐
                       │   Static    │        │  Database   │
                       │   Assets    │        │ PostgreSQL  │
                       └─────────────┘        └─────────────┘
```

### Преимущества такой архитектуры:

- ✅ **Высокая производительность** - CDN от Netlify
- ✅ **Автоматическое масштабирование** - Koyeb автоматически масштабирует бэкенд
- ✅ **Глобальное распределение** - Edge locations по всему миру
- ✅ **HTTPS из коробки** - Автоматические SSL сертификаты
- ✅ **Простое обновление** - Git-based deployments
- ✅ **Экономичность** - Платите только за использование

## ⚙️ Автоматическая настройка

### 🤖 GitHub Actions Workflow

В репозитории настроен автоматический workflow, который:

1. **Автоматически создает/обновляет файлы конфигурации**
2. **Коммитит изменения в отдельную ветку**
3. **Создает Pull Request для review**

#### Запуск workflow:

**Автоматический запуск:**
```bash
# При push в main - workflow запустится автоматически
git push origin main
```

**Ручной запуск:**
1. Идите в **Actions** → **Auto-fix Netlify + Koyeb Configuration**
2. Нажмите **Run workflow**
3. (Опционально) Укажите свой Koyeb URL
4. Нажмите **Run workflow**

#### Создаваемые файлы:

**1. `netlify.toml`** - конфигурация Netlify:
```toml
[build]
  command = "npm run build:client"
  publish = "client/dist"

[[redirects]]
  from = "/api/*"
  to = "https://central-matelda-pronto12-95b8129d.koyeb.app/api/:splat"
  status = 200
  force = true
```

**2. `.env.production`** - переменные среды:
```bash
REACT_APP_API_URL=https://central-matelda-pronto12-95b8129d.koyeb.app/api
NODE_ENV=production
```

### 🔄 Автоматический процесс:

```mermaid
graph TD
    A[Push to main] --> B[GitHub Actions запускается]
    B --> C[Создается новая ветка auto-fix/*]
    C --> D[Обновляются netlify.toml и .env.production]
    D --> E[Создается Pull Request]
    E --> F[Review и Merge PR]
    F --> G[Netlify автоматически деплоит]
```

## 🔧 Ручная настройка

### Шаг 1: Подготовка файлов

**Создайте `netlify.toml`:**
```toml
[build]
  command = "npm run build:client"
  publish = "client/dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://ваш-koyeb-url.koyeb.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'"
```

**Создайте `.env.production`:**
```bash
REACT_APP_API_URL=https://ваш-koyeb-url.koyeb.app/api
NODE_ENV=production
```

### Шаг 2: Настройка переменных среды

**Обязательные переменные для Koyeb:**
```bash
# В Koyeb Dashboard → Your App → Environment Variables
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=ваш-супер-секретный-ключ-минимум-256-бит
SESSION_SECRET=ваш-секретный-ключ-сессий
```

## 🌐 Настройка Netlify

### Шаг 1: Создание сайта

**Способ 1: Через интерфейс**
1. Заходите на [netlify.com](https://netlify.com)
2. **New site from Git** → выберите GitHub
3. Выберите репозиторий `pronto1245/AdLinkPro`
4. Netlify автоматически определит настройки из `netlify.toml`

**Способ 2: Через Netlify CLI**
```bash
# Установка CLI
npm install -g netlify-cli

# Логин
netlify login

# Деплой
netlify deploy --dir=client/dist --prod
```

### Шаг 2: Настройка переменных среды

В Netlify Dashboard → **Site settings** → **Environment variables**:

```bash
REACT_APP_API_URL=https://ваш-koyeb-url.koyeb.app/api
NODE_ENV=production
```

### Шаг 3: Настройка домена (опционально)

1. **Domain settings** → **Add custom domain**
2. Укажите ваш домен (например, `adlinkpro.com`)
3. Настройте DNS записи:
   ```
   Type: CNAME
   Name: www
   Value: ваш-сайт.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify Load Balancer)
   ```

## ☁️ Настройка Koyeb

### Шаг 1: Создание приложения

1. Заходите на [koyeb.com](https://www.koyeb.com)
2. **Create App** → **Deploy from GitHub**
3. Выберите репозиторий `pronto1245/AdLinkPro`

### Шаг 2: Настройка билда

```bash
# Build Command
npm run build

# Start Command  
npm start

# Root Directory
./

# Port
5000 (или переменная PORT)
```

### Шаг 3: Переменные среды

```bash
# Обязательные
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=super-secret-jwt-key-256-bits-minimum
SESSION_SECRET=super-secret-session-key

# База данных (рекомендуем Neon, Supabase или Railway)
DATABASE_URL=postgresql://username:password@hostname:5432/database

# Опциональные сервисы
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Интеграции с трекерами
VOLUUM_TOKEN=your-voluum-token
KEITARO_TOKEN=your-keitaro-token
BINOM_TOKEN=your-binom-token
REDTRACK_TOKEN=your-redtrack-token

# Storage (Google Cloud)
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Telegram уведомления
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Безопасность
ANTIFRAUD_LEVEL=medium
MAX_CLICKS_PER_IP_HOUR=100

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Шаг 4: База данных

**Рекомендуемые провайдеры:**

**Neon (PostgreSQL):**
```bash
# Бесплатный тариф: 3GB, 1 месяц истории
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Supabase (PostgreSQL):**
```bash
# Бесплатный тариф: 500MB, 2 недели паузы после неактивности
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**Railway (PostgreSQL):**
```bash
# $5/месяц за usage
DATABASE_URL=postgresql://postgres:xxx@containers-us-west-xxx.railway.app:6543/railway
```

## 🔄 CI/CD Pipeline

### Автоматический деплой

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Build Frontend]
    C --> D[Deploy to Netlify]
    B --> E[Build Backend]
    E --> F[Deploy to Koyeb]
```

### Настройка GitHub Actions для деплоя

**`.github/workflows/deploy-netlify.yml`:**
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install and build
      run: |
        npm ci
        npm run build:client
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v3.0
      with:
        publish-dir: './client/dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🐛 Troubleshooting

### Частые проблемы и решения

#### 1. API запросы не проходят

**Проблема:** 404 или CORS ошибки при обращении к API

**Решение:**
```bash
# Проверьте netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://ваш-koyeb-url.koyeb.app/api/:splat"
  status = 200
  force = true

# Проверьте .env.production
REACT_APP_API_URL=https://ваш-koyeb-url.koyeb.app/api
```

#### 2. Koyeb приложение не запускается

**Проблема:** Build или runtime ошибки

**Решение:**
```bash
# Проверьте package.json scripts
"scripts": {
  "build": "npm run build:server",
  "start": "node dist/index.js"
}

# Проверьте переменные среды
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

#### 3. Netlify Functions не работают

**Проблема:** Серверные функции недоступны

**Решение:**
```bash
# В netlify.toml измените путь для API
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"  # Для Netlify Functions
  # ИЛИ
  to = "https://koyeb-url.koyeb.app/api/:splat"  # Для внешнего API
```

#### 4. SSL/HTTPS проблемы

**Проблема:** Mixed content или SSL ошибки

**Решение:**
```bash
# Убедитесь что все URL используют HTTPS
REACT_APP_API_URL=https://koyeb-url.koyeb.app/api  # НЕ http://

# В netlify.toml добавьте Force HTTPS
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

### Отладка

#### Логи Netlify:
```bash
# Deploy logs
netlify logs

# Function logs  
netlify functions:logs
```

#### Логи Koyeb:
1. Koyeb Dashboard → Your App → Logs
2. Real-time logs в браузере
3. Download logs для анализа

#### Тестирование API:
```bash
# Проверка health endpoint
curl https://ваш-koyeb-url.koyeb.app/health

# Проверка через Netlify proxy
curl https://ваш-netlify-сайт.netlify.app/api/health
```

## 📊 Мониторинг

### Метрики производительности

#### Netlify Analytics:
- Page views
- Unique visitors  
- Bandwidth usage
- Build time
- Deploy frequency

#### Koyeb Metrics:
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

### Настройка алертов

**Koyeb Alerts:**
1. Dashboard → Monitoring → Alerts
2. Настройте уведомления для:
   - High CPU (>80%)
   - High memory (>90%)
   - Error rate (>5%)
   - Response time (>2s)

**Netlify Notifications:**
1. Site settings → Notifications
2. Deploy notifications
3. Form submissions
4. Large files warnings

### Health Checks

**Создайте monitoring script:**
```bash
#!/bin/bash
# health-check.sh

NETLIFY_URL="https://ваш-сайт.netlify.app"
KOYEB_URL="https://ваш-koyeb-url.koyeb.app"

# Check Netlify
if curl -f -s "$NETLIFY_URL" > /dev/null; then
    echo "✅ Netlify OK"
else
    echo "❌ Netlify DOWN"
fi

# Check Koyeb API
if curl -f -s "$KOYEB_URL/health" > /dev/null; then
    echo "✅ Koyeb API OK"
else
    echo "❌ Koyeb API DOWN"
fi

# Check API through Netlify proxy
if curl -f -s "$NETLIFY_URL/api/health" > /dev/null; then
    echo "✅ API Proxy OK"
else
    echo "❌ API Proxy DOWN"
fi
```

### Оптимизация производительности

#### Frontend (Netlify):
```toml
# netlify.toml - кэширование
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Backend (Koyeb):
```javascript
// Кэширование в памяти
const cache = new Map();

app.get('/api/offers', (req, res) => {
  const cacheKey = 'offers';
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  // Загрузка из БД
  const offers = loadOffersFromDB();
  cache.set(cacheKey, offers);
  
  res.json(offers);
});
```

## 🎯 Рекомендации

### Безопасность

1. **Всегда используйте HTTPS**
2. **Настройте CSP заголовки**
3. **Регулярно обновляйте зависимости**
4. **Используйте strong JWT secrets**
5. **Настройте rate limiting**

### Производительность

1. **Включите кэширование**
2. **Оптимизируйте изображения**
3. **Используйте code splitting**
4. **Настройте DB connection pooling**
5. **Мониторьте производительность**

### Масштабирование

1. **Используйте CDN для статики**
2. **Настройте автоскейлинг в Koyeb**
3. **Оптимизируйте DB запросы**
4. **Добавьте кэширование Redis**
5. **Планируйте capacity**

## 🆘 Поддержка

### Документация
- [Netlify Docs](https://docs.netlify.com/)
- [Koyeb Docs](https://www.koyeb.com/docs)
- [AdLinkPro GitHub](https://github.com/pronto1245/AdLinkPro)

### Сообщество
- GitHub Issues для багов и feature requests
- GitHub Discussions для вопросов
- Telegram чат для быстрой помощи

### Полезные ссылки
- 🌐 [Netlify Status](https://www.netlifystatus.com/)
- ☁️ [Koyeb Status](https://status.koyeb.com/)
- 📊 [PostgreSQL Performance](https://pgtune.leopard.in.ua/)
- 🔒 [SSL Test](https://www.ssllabs.com/ssltest/)

---

## 🎉 Заключение

Поздравляем! Теперь у вас есть полностью автоматизированная система деплоя для AdLinkPro с использованием Netlify + Koyeb.

### Что у вас теперь есть:

✅ **Автоматическое обновление конфигурации** через GitHub Actions  
✅ **Высокопроизводительный фронтенд** на Netlify CDN  
✅ **Масштабируемый бэкенд** на Koyeb  
✅ **Автоматические HTTPS сертификаты**  
✅ **Git-based deployments**  
✅ **Готовая система мониторинга**  

### Следующие шаги:

1. 🚀 **Запустите первый деплой** через GitHub Actions
2. 🔍 **Проверьте работу** всех компонентов  
3. 📊 **Настройте мониторинг** и алерты
4. 🎯 **Кастомизируйте** под ваши нужды
5. 📈 **Масштабируйте** по мере роста

**Удачного деплоя! 🚀**