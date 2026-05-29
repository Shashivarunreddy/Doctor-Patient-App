# Stage 1 — Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Stage 2 — Production
FROM node:22-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma files first
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Run prisma generate in production stage to create .prisma/client
RUN npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client
COPY --from=builder /app/src/generated ./src/generated

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

CMD ["node", "dist/server.js"]