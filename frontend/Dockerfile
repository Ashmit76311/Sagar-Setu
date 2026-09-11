FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server accessible from Docker host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
