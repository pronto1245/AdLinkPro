# Этап 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Этап 2: Production
FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 8000

CMD ["node", "dist/index.js"]
