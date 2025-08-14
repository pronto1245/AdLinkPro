# --- build ---
FROM node:20-alpine AS build
WORKDIR /app

# Нужны тулчейны для сборки некоторых пакетов
RUN apk add --no-cache python3 make g++

# Ставим зависимости
COPY package*.json ./
RUN npm install

# Исходники
COPY . .

# Сборка: клиент + сервер
# Ожидается, что package.json содержит:
# "build": "npm run build:client && npm run build:server && mkdir -p dist/public && [ -d client/dist ] && cp -r client/dist/* dist/public/ || true"
RUN npm run build

# Оставляем только prod-зависимости
RUN npm prune --omit=dev

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Берём готовые артефакты и prod-зависимости из build-слоя
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000
# Запускаем CommonJS-бандл, который мы собираем как dist/index.cjs
CMD ["node", "dist/index.cjs"]
