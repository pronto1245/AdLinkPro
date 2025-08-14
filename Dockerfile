# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# Нужны тулчейны для нативных модулей
RUN apk add --no-cache python3 make g++

# Устанавливаем зависимости (если lock «сломался», откатываемся на install)
COPY package*.json ./
RUN npm ci || npm install

# Копируем исходники и билдим
COPY . .
RUN npm run build

# Гарантируем CJS-энтрипоинт: если есть dist/index.js — переименуем в .cjs
RUN [ -f dist/index.cjs ] || ( [ -f dist/index.js ] && mv dist/index.js dist/index.cjs ) || true

# Оставляем только прод-зависимости для рантайма
RUN npm prune --omit=dev

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Берём собранный код и уже «пропруденные» модули из build-слоя
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000
CMD ["node", "dist/index.cjs"]
