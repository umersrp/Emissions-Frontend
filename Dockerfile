# Use lightweight Node.js image
FROM node:22-slim

# Set working directory
WORKDIR /usr/src/app

# Copy only package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Build the app
RUN npm run build

# Expose port (use 3000 or your custom one)
EXPOSE 3001

# Start the built app with Vite preview
CMD ["npm", "start"]