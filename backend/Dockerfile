# Multi-stage build for production optimization
FROM node:22-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3111

# Start development server
CMD ["dumb-init", "npm", "run", "start:dev"]

# Build stage
FROM base AS builder

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3111

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3111/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]