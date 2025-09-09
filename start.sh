#!/bin/sh
# Start backend server in background
cd /app/server
npm start &
# Start frontend (Next.js) in foreground
cd /app/yourtube
npm run start

