FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# ставим только prod-deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# берем только собранный dist
COPY --from=build /app/dist ./dist

# Koyeb сам передаст PORT
CMD ["npm","start"]
