FROM node:20-bullseye

# Install system dependencies (PDF + Image + DOCX)
RUN apt-get update && apt-get install -y \
    imagemagick \
    ghostscript \
    poppler-utils \
    libreoffice \
    libreoffice-writer \
    libreoffice-core \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN which magick || which convert
RUN which libreoffice

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]