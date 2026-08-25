# Stage 1: Build stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4200

# Start with ng serve (development mode)
# This serves the app with live reload and proper base href handling
CMD ["npm", "start"]
