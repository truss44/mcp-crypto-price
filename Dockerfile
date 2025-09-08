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

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

ENV NODE_ENV=production

# Install production dependencies without running scripts
RUN npm ci --omit=dev --ignore-scripts

# Set environment variables if needed
# ENV COINCAP_API_KEY=<YOUR_API_KEY>

# Command to run the application
CMD ["node", "dist/index.js"]