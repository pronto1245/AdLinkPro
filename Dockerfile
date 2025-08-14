FROM node:18-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем исходники
COPY . .

# Устанавливаем TypeScript глобально для сборки
RUN npm install -g typescript tsx

# Собираем проект
RUN npm run build 2>/dev/null || echo "Build script not found, continuing..."

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV JWT_SECRET=production-jwt-secret-change-in-production
ENV SESSION_SECRET=production-session-secret
ENV SENDGRID_API_KEY=""
ENV VOLUUM_TOKEN=""
ENV KEITARO_TOKEN=""
ENV BINOM_TOKEN=""
ENV REDTRACK_TOKEN=""
ENV GOOGLE_CLOUD_PROJECT_ID=""
ENV GOOGLE_CLOUD_STORAGE_BUCKET=""

# Запускаем продакшн сборку
CMD ["npm", "start"]