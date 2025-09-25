# Stage 1: Build Vue.js project
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Sử dụng build argument với giá trị mặc định
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_TIMEOUT=30000

COPY . .
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:alpine

# Copy Nginx config vào container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build output vào thư mục phục vụ của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]