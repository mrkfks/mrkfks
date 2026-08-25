# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application with SSR
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4200', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the SSR server
CMD ["npm", "run", "serve:ssr:mrkfks"]
