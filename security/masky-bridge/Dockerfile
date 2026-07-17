FROM node:22-slim

WORKDIR /app

# Install deps first for layer caching.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Bridge source.
COPY server.js scope.js ./

# Inside the compose network the bridge must listen on all interfaces so the
# Pomerium container can reach it. It is NOT published to the host (see compose).
ENV BRIDGE_HOST=0.0.0.0
ENV BRIDGE_PORT=8080

EXPOSE 8080
CMD ["node", "server.js"]
