# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files & prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules, compiled dist, and Prisma client from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN mkdir -p public/uploads/attachments public/uploads/avatars

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
