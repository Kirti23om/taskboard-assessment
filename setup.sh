#!/bin/bash

echo "🚀 Setting up Todo App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Root environment file created."
fi

if [ ! -f backend/.env ]; then
    cp env.example backend/.env
    echo "✅ Backend environment file created."
fi

if [ ! -f frontend/.env ]; then
    cp env.example frontend/.env
    echo "✅ Frontend environment file created."
fi

echo "✅ All environment files created. Please update .env files with your settings if needed."

# Setup database first
echo "🗄️ Setting up database..."
npm run db:setup

echo "✅ Database setup complete!"

# Go back to root
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "To run tests:"
echo "  npm run test:all"
echo ""
echo "Demo account:"
echo "  Email: demo@local.com"
echo "  Password: demo123"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
