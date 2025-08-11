# 🔐 Секретные переменные для деплоя

## ⚠️ КОНФИДЕНЦИАЛЬНО - НЕ ПУБЛИКОВАТЬ

### 📋 Список всех секретов

```env
# === БАЗОВЫЕ СЕКРЕТЫ ===
JWT_SECRET="super-secure-jwt-secret-key-256-bits-minimum-length-required-for-production-use"
SESSION_SECRET="super-secure-session-secret-key-please-change-in-production"

# === БАЗА ДАННЫХ ===
DATABASE_URL="postgresql://affiliate_user:secure_password_123@db-host:5432/affiliate_pro_db"

# === EMAIL СЕРВИС ===
SENDGRID_API_KEY="SG.actual_sendgrid_api_key_here"
SENDGRID_FROM_EMAIL="noreply@affiliate-pro.com"

# === ТРЕКЕРЫ ===
VOLUUM_TOKEN="actual_voluum_api_token_here"
KEITARO_TOKEN="actual_keitaro_api_token_here"
BINOM_TOKEN="actual_binom_api_token_here"
REDTRACK_TOKEN="actual_redtrack_api_token_here"

# === GOOGLE CLOUD ===
GOOGLE_CLOUD_PROJECT_ID="affiliate-pro-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="affiliate-pro-storage"
# Путь к JSON файлу с ключами GCP
GOOGLE_APPLICATION_CREDENTIALS="/path/to/gcp-service-account.json"

# === TELEGRAM BOT ===
TELEGRAM_BOT_TOKEN="actual_telegram_bot_token_here"
TELEGRAM_CHAT_ID="actual_telegram_chat_id_here"
```

## 🚀 Инструкции по настройке

### 1. Генерация JWT_SECRET
```bash
# Способ 1: OpenSSL
openssl rand -hex 32

# Способ 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Способ 3: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Настройка базы данных
**Для PostgreSQL (рекомендуется):**
- Создать базу данных: `affiliate_pro_db`
- Создать пользователя с правами доступа
- Получить строку подключения

**Для тестирования (SQLite):**
```env
DATABASE_URL="file:./dev.db"
```

### 3. Настройка SendGrid
1. Зарегистрироваться на [sendgrid.com](https://sendgrid.com)
2. Создать API ключ в настройках
3. Верифицировать домен отправителя

### 4. Интеграция с трекерами
**Voluum:**
- Получить API токен в настройках аккаунта
- Настроить вебхуки на ваш домен

**Keitaro:**
- Получить API ключ в админпанели
- Настроить постбек URLs

**Binom:**
- Получить API токен в настройках
- Настроить интеграцию с платформой

**RedTrack:**
- Получить API ключ в профиле
- Настроить трекинг ссылки

### 5. Google Cloud Storage
1. Создать проект в [Google Cloud Console](https://console.cloud.google.com)
2. Создать Service Account
3. Скачать JSON файл с ключами
4. Создать Storage bucket
5. Настроить права доступа

### 6. Telegram Bot
1. Создать бота через [@BotFather](https://t.me/botfather)
2. Получить токен бота
3. Получить ID чата для уведомлений

## 🔒 Безопасность

### ✅ Обязательно:
- Используйте разные секреты для dev/stage/prod
- Никогда не коммитьте .env файлы в Git
- Регулярно обновляйте API ключи
- Используйте SSL/HTTPS везде
- Ограничьте доступ к переменным окружения

### 🚨 В продакшене:
- Используйте сервисы управления секретами (AWS Secrets Manager, Azure Key Vault, etc.)
- Включите 2FA для всех внешних сервисов
- Мониторьте использование API ключей
- Настройте алерты на подозрительную активность

## 🌐 Настройка доменов

### DNS записи:
```
A    @                 YOUR_SERVER_IP
CNAME www              your-domain.com
CNAME api              your-domain.com
CNAME cdn              your-domain.com
```

### SSL сертификаты:
- Используйте Let's Encrypt или Cloudflare
- Настройте автообновление
- Включите HSTS заголовки

## ⚙️ Переменные для каждой платформы

### Railway:
- Добавить все переменные через dashboard
- Настроить автодеплой с GitHub
- Подключить PostgreSQL add-on

### Vercel:
```bash
vercel env add JWT_SECRET
vercel env add DATABASE_URL
# ... остальные переменные
```

### Netlify:
- Для статической сборки переменные не нужны
- Использовать только для фронтенд части

### Docker:
```bash
docker run -d \
  --name affiliate-pro \
  -p 5000:5000 \
  --env-file .env \
  affiliate-pro:latest
```

## 📊 Мониторинг

### Логирование:
- Все секреты должны быть замаскированы в логах
- Настроить ротацию логов
- Мониторить ошибки аутентификации

### Алерты:
- Неудачные попытки входа
- Превышение лимитов API
- Ошибки подключения к БД
- Проблемы с SSL сертификатами

---
**ВНИМАНИЕ: Этот файл содержит чувствительную информацию и не должен быть доступен публично!** 🔒