# 🐳 DOCKER КОНФИГУРАЦИИ AdLinkPro
## Полная настройка контейнеризации

---

## 📦 **PRODUCTION DOCKERFILE**

```dockerfile
# Dockerfile
# Multi-stage build для оптимизации размера образа

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Создание пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 adlinkpro

# Копирование файлов
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=adlinkpro:nodejs /app/dist ./dist
COPY --from=builder --chown=adlinkpro:nodejs /app/server ./server
COPY --from=builder --chown=adlinkpro:nodejs /app/shared ./shared
COPY --from=builder --chown=adlinkpro:nodejs /app/package*.json ./

# Создание директорий для логов и кеша
RUN mkdir -p /app/logs /app/.cache && \
    chown -R adlinkpro:nodejs /app/logs /app/.cache

USER adlinkpro

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"]
```

---

## 📋 **PRODUCTION DOCKER COMPOSE**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Основное приложение
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: adlinkpro-app
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://adlinkpro:${DB_PASSWORD}@db:5432/adlinkpro
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - REDIS_URL=redis://redis:6379
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - VOLUUM_TOKEN=${VOLUUM_TOKEN}
      - KEITARO_TOKEN=${KEITARO_TOKEN}
      - BINOM_TOKEN=${BINOM_TOKEN}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - app_logs:/app/logs
      - app_cache:/app/.cache
    networks:
      - adlinkpro-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # PostgreSQL база данных
  db:
    image: postgres:15-alpine
    container_name: adlinkpro-db
    environment:
      - POSTGRES_DB=adlinkpro
      - POSTGRES_USER=adlinkpro
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    restart: unless-stopped
    ports:
      - "5432:5432"
    networks:
      - adlinkpro-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U adlinkpro"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Redis для кеширования и сессий
  redis:
    image: redis:7-alpine
    container_name: adlinkpro-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - adlinkpro-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: adlinkpro-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certs:/etc/nginx/certs:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - adlinkpro-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Prometheus мониторинг
  prometheus:
    image: prom/prometheus:latest
    container_name: adlinkpro-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - adlinkpro-network

  # Grafana для визуализации
  grafana:
    image: grafana/grafana:latest
    container_name: adlinkpro-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    networks:
      - adlinkpro-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  app_logs:
    driver: local
  app_cache:
    driver: local
  nginx_logs:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  adlinkpro-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## ⚙️ **NGINX КОНФИГУРАЦИЯ**

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Логирование
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Основные настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream для приложения
    upstream app_backend {
        least_conn;
        server app:5000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Основная конфигурация сервера
    include /etc/nginx/conf.d/*.conf;
}
```

```nginx
# nginx/conf.d/adlinkpro.conf
# HTTP сервер (редирект на HTTPS)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Безопасность заголовков
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; media-src 'self'; object-src 'none'; child-src 'self'; form-action 'self'; base-uri 'self';" always;

    # Rate limiting для API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting для логина
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket поддержка
    location /ws {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket таймауты
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Статические файлы
    location /assets/ {
        alias /var/www/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Сжатие для статики
        gzip_static on;
    }

    # Основное приложение
    location / {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Логи
    access_log /var/log/nginx/adlinkpro_access.log main;
    error_log /var/log/nginx/adlinkpro_error.log;
}
```

---

## 🔐 **ENVIRONMENT ФАЙЛЫ**

```bash
# .env.production
NODE_ENV=production
PORT=5000

# База данных
DATABASE_URL=postgresql://adlinkpro:${DB_PASSWORD}@db:5432/adlinkpro

# Секреты безопасности
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}

# Redis
REDIS_URL=redis://redis:6379

# Email сервис
SENDGRID_API_KEY=${SENDGRID_API_KEY}

# Трекеры
VOLUUM_TOKEN=${VOLUUM_TOKEN}
KEITARO_TOKEN=${KEITARO_TOKEN}
BINOM_TOKEN=${BINOM_TOKEN}
REDTRACK_TOKEN=${REDTRACK_TOKEN}

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
GOOGLE_CLOUD_STORAGE_BUCKET=${GOOGLE_CLOUD_STORAGE_BUCKET}
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/gcp-key.json

# Telegram Bot
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_WEBHOOK_URL=${TELEGRAM_WEBHOOK_URL}

# Мониторинг
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

```bash
# .env.example
# Скопируйте в .env и заполните значения

# База данных
DB_PASSWORD=your-secure-database-password

# Секреты (сгенерируйте длинные случайные строки)
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters
SESSION_SECRET=your-session-secret-key-minimum-64-characters

# Email
SENDGRID_API_KEY=your-sendgrid-api-key

# Трекеры (опционально)
VOLUUM_TOKEN=your-voluum-token
KEITARO_TOKEN=your-keitaro-token
BINOM_TOKEN=your-binom-token

# Grafana
GRAFANA_PASSWORD=your-grafana-admin-password
```

---

## 📊 **МОНИТОРИНГ КОНФИГУРАЦИИ**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'adlinkpro-app'
    static_configs:
      - targets: ['app:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

## 🚀 **СКРИПТЫ РАЗВЕРТЫВАНИЯ**

```bash
#!/bin/bash
# deploy-docker.sh

set -e

echo "🐳 Начинаем Docker развертывание AdLinkPro..."

# Проверка зависимостей
command -v docker >/dev/null 2>&1 || { echo "Docker не установлен!" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose не установлен!" >&2; exit 1; }

# Создание директорий
mkdir -p {nginx/conf.d,certs,monitoring,init-scripts,logs}

# Генерация секретов
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Создание .env файла
cat << EOF > .env
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
EOF

echo "✅ Секреты сгенерированы и сохранены в .env"

# Создание сетей
docker network create adlinkpro-network 2>/dev/null || true

# Запуск сервисов
echo "🚀 Запускаем сервисы..."
docker-compose -f docker-compose.prod.yml up -d

# Ожидание запуска БД
echo "⏳ Ожидаем запуск базы данных..."
sleep 30

# Инициализация БД
echo "📊 Инициализируем базу данных..."
docker-compose -f docker-compose.prod.yml exec app npm run db:push

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно на: http://localhost"
echo "📊 Grafana доступна на: http://localhost:3000 (admin:$GRAFANA_PASSWORD)"
echo "📈 Prometheus доступен на: http://localhost:9090"
```

```bash
#!/bin/bash
# update-docker.sh

set -e

echo "🔄 Обновляем AdLinkPro..."

# Создание бекапа
echo "💾 Создаем бекап..."
docker-compose -f docker-compose.prod.yml exec db pg_dump -U adlinkpro adlinkpro > backup_$(date +%Y%m%d_%H%M%S).sql

# Обновление кода
git pull origin main

# Пересборка образов
echo "🔨 Пересобираем образы..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Перезапуск сервисов
echo "🚀 Перезапускаем сервисы..."
docker-compose -f docker-compose.prod.yml up -d

# Применение миграций
echo "📊 Применяем миграции..."
docker-compose -f docker-compose.prod.yml exec app npm run db:push

echo "✅ Обновление завершено!"
```

---

## 🔧 **ДОПОЛНИТЕЛЬНЫЕ КОНФИГУРАЦИИ**

### **Redis конфигурация:**
```
# redis.conf
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### **PostgreSQL инициализация:**
```sql
-- init-scripts/01-init.sql
-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Оптимизация производительности
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

SELECT pg_reload_conf();
```

---

## ✅ **ПРОВЕРКА РАЗВЕРТЫВАНИЯ**

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Проверяем статус сервисов..."

# Проверка контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверка health check
echo "❤️ Health checks:"
curl -f http://localhost:5000/api/health || echo "❌ App health check failed"
docker-compose -f docker-compose.prod.yml exec db pg_isready -U adlinkpro || echo "❌ DB health check failed"
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping || echo "❌ Redis health check failed"

# Проверка логов
echo "📋 Последние логи приложения:"
docker-compose -f docker-compose.prod.yml logs --tail=20 app

echo "✅ Проверка завершена"
```

**🎉 Полная Docker конфигурация AdLinkPro готова к production развертыванию!**