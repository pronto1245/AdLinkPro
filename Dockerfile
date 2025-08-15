FROM node:20-alpine
WORKDIR /app

# 1) ставим ВСЕ зависимости (включая dev)
COPY package*.json ./
RUN npm ci

# 2) копируем исходники и собираем (esbuild уже есть)
COPY . .
RUN npm run build

# 3) оставляем только prod-deps (урезаем образ)
RUN npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production
# Koyeb подставляет PORT, приложение должно слушать process.env.PORT
CMD ["npm","start"]
