# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy frontend package.json and lockfile
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build frontend (Next.js)
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start frontend server
CMD ["npm", "run", "start"]
