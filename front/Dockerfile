# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app
COPY . ./
RUN npm install -save
RUN npm run build

# Stage 2: Serve the built files with lighttpd
FROM rtsp/lighttpd:latest
COPY --from=build /app/dist /var/www/html/

EXPOSE 80

