# Build stage
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN pnpm build

# Production stage
FROM node:24-alpine AS release

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install pnpm and production dependencies without running scripts
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --prod --ignore-scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy application files with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Required: set your CoinCap API key
# ENV COINCAP_API_KEY=<YOUR_API_KEY>

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the HTTP server
CMD ["node", "dist/http.js"]
