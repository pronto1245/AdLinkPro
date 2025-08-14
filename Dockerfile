# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++

# копируем только манифесты для кеша
COPY server/package*.json server/
COPY client/package*.json client/

# если есть package-lock.json -> npm ci, иначе -> npm install
RUN if [ -f server/package-lock.json ]; then npm ci --prefix server; else npm install --prefix server; fi
RUN if [ -f client/package-lock.json ]; then npm ci --prefix client; else npm install --prefix client; fi

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# перенесем зависимости и дальше исходники
COPY --from=deps /app /app
COPY server server
COPY client client
COPY shared shared

# сборка фронта и бэка
RUN npm run build --prefix client
RUN npm run build --prefix server

# кладем собранный фронт туда, откуда его отдаст сервер
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# только нужное на прод
COPY --from=deps /app/server/node_modules server/node_modules
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/public server/public
COPY server/package*.json server/
COPY shared shared

EXPOSE 5000
CMD ["node", "server/dist/index.js"]
