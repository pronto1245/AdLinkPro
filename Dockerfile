# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++

# копируем исходники полностью (чтобы точно были package.json)
COPY server server
COPY client client
COPY shared shared

# ставим зависимости (если есть lock — ci, иначе — install)
RUN if [ -f server/package-lock.json ]; then npm ci --prefix server; else npm install --prefix server; fi
RUN if [ -f client/package-lock.json ]; then npm ci --prefix client; else npm install --prefix client; fi

# сборка фронта и бэкенда
RUN npm run build --prefix client
RUN npm run build --prefix server

# положим фронт в public сервера
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# копируем только то, что нужно для рантайма
COPY --from=build /app/server/node_modules server/node_modules
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/public server/public
COPY server/package*.json server/
COPY shared shared

EXPOSE 5000
CMD ["node", "server/dist/index.js"]
