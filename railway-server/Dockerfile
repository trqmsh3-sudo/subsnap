# Use the official Playwright image — Chromium + all system deps pre-installed
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

# Copy deps first for layer caching
COPY package.json ./
RUN npm install --omit=dev

# Playwright browsers are already in the base image, but pin chromium explicitly
RUN npx playwright install chromium

# Copy server source
COPY server.js ./

# Railway injects PORT automatically; default to 3000 for local testing
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
