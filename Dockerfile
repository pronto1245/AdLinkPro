FROM node:18-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходники и собираем
COPY . .
RUN npm run build

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Запускаем продакшн сборку
CMD ["npm", "start"]