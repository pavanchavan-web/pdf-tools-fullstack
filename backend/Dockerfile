FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    imagemagick \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# VERY IMPORTANT: verify ImageMagick binary
RUN which magick || which convert

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
