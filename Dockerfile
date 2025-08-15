FROM node:20-alpine

WORKDIR /app

# Устанавливаем только прод-зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем исходники и собираем
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Koyeb сам проставит PORT; приложение должно слушать process.env.PORT
CMD ["npm","start"]
