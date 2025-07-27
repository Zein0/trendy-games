#!/bin/bash

# Development script for Trendy Games
# This script helps run both frontend and backend in development mode

echo "🎮 Starting Trendy Games Development Environment..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Stopping all processes..."
    pkill -f "npm run dev"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if node_modules exist
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start backend in background
echo "🚀 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "🌐 Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "⚡ Backend: http://localhost:3001"
echo "🔍 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID