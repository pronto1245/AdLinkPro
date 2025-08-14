# ---------- deps: ставим зависимости client и server ----------
FROM node:20-alpine AS deps
WORKDIR /app
# Нужны тулзы для нативных модулей (на всякий случай)
RUN apk add --no-cache python3 make g++

# Копируем только манифесты, чтобы кешировалось
COPY server/package*.json server/
COPY client/package*.json client/

# Ставим зависимости отдельно в каждую часть
RUN npm ci --prefix server
RUN npm ci --prefix client

# ---------- build: собираем фронт и бэкенд ----------
FROM node:20-alpine AS build
WORKDIR /app

# Переносим установленные node_modules
COPY --from=deps /app /app

# Копируем исходники
COPY server server
COPY client client
COPY shared shared

# (Опционально) если нужно прокинуть переменную в Vite:
# ARG VITE_API_URL
# ENV VITE_API_URL=${VITE_API_URL}

# Сборка фронта (Vite)
RUN npm run build --prefix client

# Сборка бэкенда (TS → JS)
RUN npm run build --prefix server

# Кладём собранный фронт туда, откуда его отдаст сервер
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# ---------- runtime: лёгкий образ только с тем, что нужно на проде ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем prod-зависимости сервера и сборки
COPY --from=deps /app/server/node_modules server/node_modules
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/public server/public
COPY server/package*.json server/
COPY shared shared

EXPOSE 5000
CMD ["node", "server/dist/index.js"]

