# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app
COPY yourtube ./yourtube
COPY server ./server

# Copy package.json and package-lock.json for both frontend and backend
COPY yourtube/package.json yourtube/package-lock.json ./yourtube/
COPY server/package.json server/package-lock.json ./server/

# Install backend dependencies
WORKDIR /app/server
RUN npm install

# Install frontend dependencies and build
WORKDIR /app/yourtube
RUN npm install && npm run build


# Copy start script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose ports (3000 for frontend, 5000 for backend)
EXPOSE 3000 5000

# Start both frontend and backend
CMD ["./start.sh"]

