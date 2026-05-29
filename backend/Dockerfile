# Stage 1 — Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy Prisma files and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Stage 2 — Production
FROM node:22-alpine

# Fix #22 — create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Fix #21 — install prisma CLI in production stage for migrate deploy
RUN npm install prisma --save-dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and config (needed for migrate deploy at runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy generated Prisma client (fix for MODULE_NOT_FOUND)
COPY --from=builder /app/src/generated ./src/generated

# Fix #22 — set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Fix #22 — switch to non-root user
USER appuser

EXPOSE 5000

CMD ["node", "dist/server.js"]