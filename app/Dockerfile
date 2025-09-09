# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

# ✅ Require tracing.js before server.js
CMD ["node", "server.js"]

