# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend package.json and lockfile
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]
