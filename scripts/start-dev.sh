#!/bin/bash

# Artha-Mantra Development Start Script
echo "🚀 Starting Artha-Mantra development servers..."

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "🔧 Starting MongoDB..."
    brew services start mongodb-community
    sleep 2
fi

# Check if ports are available
if check_port 5050; then
    echo "⚠️  Port 5050 is already in use. Please stop the process or use a different port."
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Please stop the process or use a different port."
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🔧 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo "   - Backend: http://localhost:5050 (PID: $BACKEND_PID)"
echo "   - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for user interrupt
wait
