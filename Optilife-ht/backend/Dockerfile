FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=5003
EXPOSE 5003
CMD ["node", "server.js"]
