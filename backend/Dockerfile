# Use stable Debian-based Node image
FROM node:20-bullseye

# Install system dependencies (CRITICAL)
RUN apt-get update && apt-get install -y \
  imagemagick \
  ghostscript \
  poppler-utils \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy backend source
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
