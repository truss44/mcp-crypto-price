# Build stage
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS release

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies without running scripts
RUN npm ci --omit=dev --ignore-scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy application files with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json

# Switch to non-root user
USER nodejs

# Optional: set your CoinCap API key for higher rate limits
# ENV COINCAP_API_KEY=<YOUR_API_KEY>

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the HTTP server
CMD ["node", "dist/http.js"]
