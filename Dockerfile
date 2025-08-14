# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# системные пакеты на случай нативных модулей
RUN apk add --no-cache python3 make g++

# ставим только то, что нужно для сборки
COPY package*.json ./
RUN npm install

# код
COPY . .

# сборка только сервера
RUN npm run build

# чистим dev-зависимости из node_modules
RUN npm prune --omit=dev

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# артефакты сборки и prod-зависимости
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 5000
CMD ["node", "dist/index.js"]
