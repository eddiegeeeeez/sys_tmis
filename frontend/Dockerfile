# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
# Override outDir to 'dist' for Docker (vite.config.ts defaults to ../backend/.../wwwroot for CI/CD)
RUN npx vite build --outDir dist

# Production runtime stage
FROM nginx:alpine
EXPOSE 80

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
