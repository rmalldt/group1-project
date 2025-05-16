FROM node:18
WORKDIR /app
COPY package*.json /app
RUN npm install
COPY . /app
ENV DB_HOST=rangeiq-db
ENV DB_NAME=rangeiq
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=docker
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/index.js"]