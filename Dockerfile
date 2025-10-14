# Step 1: Build the Vite app
FROM node:22-slim as build

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies while ignoring peer-dependency conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the app source
COPY . .

# Disable CI mode and Node deprecation warnings during build
ENV NODE_OPTIONS="--no-deprecation"
ENV CI=false

# Build the Vite app (this will now ignore deprecated dependency warnings)
RUN npm run build

# Step 2: Serve the app using a lightweight server
FROM node:22-slim

WORKDIR /app

# Install "serve" globally to host the production build
RUN npm install -g serve

# Copy the Vite build output from previous stage
# Vite outputs to "dist" folder
COPY --from=build /usr/src/app/dist ./build

# Expose the app port
EXPOSE 3001

# Serve the static files from the build folder
CMD ["serve", "-s", "build", "-l", "3001"]
