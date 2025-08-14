# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# для возможных нативных модулей
RUN apk add --no-cache python3 make g++

# сперва только манифесты — кэш зависимостей
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# весь проект
COPY . .

# сборка: client (Vite) + server (esbuild -> CJS)
RUN npm run build

# если бандл сервера .js — переименуем в .cjs
RUN [ -f dist/index.cjs ] || ( [ -f dist/index.js ] && mv dist/index.js dist/index.cjs ) || true

# отрезаем dev-зависимости
RUN npm prune --omit=dev

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# берём собранное и node_modules из build-слоя
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000
CMD ["node", "dist/index.cjs"]
