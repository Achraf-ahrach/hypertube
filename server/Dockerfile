# -------- Base Node image --------
FROM node:20-alpine AS base

# -------- Install deps --------
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# -------- Build NestJS --------
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# -------- Production Run --------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001

CMD ["node", "dist/main.js"]
