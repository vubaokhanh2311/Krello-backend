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

# Copy package files and install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copy compiled dist and generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p public/uploads/attachments public/uploads/avatars

EXPOSE 3000

CMD ["node", "dist/main.js"]
