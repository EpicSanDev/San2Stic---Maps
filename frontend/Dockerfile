# Multi-stage build for React frontend
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set build-time environment variables
ARG REACT_APP_ICECAST_STREAM_URL=/stream
ARG REACT_APP_ICECAST_METADATA_URL=/icecast/status-json.xsl
ARG REACT_APP_API_BASE_URL=/api

ENV REACT_APP_ICECAST_STREAM_URL=$REACT_APP_ICECAST_STREAM_URL
ENV REACT_APP_ICECAST_METADATA_URL=$REACT_APP_ICECAST_METADATA_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]