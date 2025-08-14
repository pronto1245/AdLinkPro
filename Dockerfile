# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Тулы для сборки нативных зависимостей (на всякий случай)
RUN apk add --no-cache python3 make g++

# Сначала только манифесты, чтобы кеш лучше работал
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Теперь код
COPY . .

# Сборка проекта (скрипт "build" должен собрать сервер в /app/dist)
RUN npm run build

# Диагностика: покажем содержимое dist (не ломает сборку, просто лог)
RUN ls -la /app/dist || true

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Берём собранный код и prod-зависимости
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000

# Универсальный запуск: сначала пробуем dist/index.cjs, иначе dist/index.js
CMD ["/bin/sh", "-lc", "if [ -f dist/index.cjs ]; then node dist/index.cjs; else node dist/index.js; fi" ]
