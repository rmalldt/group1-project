# Stage 1: Build the client
FROM node:20-alpine AS build

WORKDIR /client

# Install dependencies and build the client
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the client with Nginx
FROM nginx:alpine

# Copy the build files from the previous stage to the Nginx HTML directory
COPY --from=build /client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]