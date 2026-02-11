#!/bin/bash

# Start Development Server Script
# This script starts the Next.js development server using PM2

echo "🚀 Starting DXL Music HUB in DEVELOPMENT mode..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "📋 Checking for existing processes..."
pm2 delete singf-dev 2>/dev/null || true

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start development server with PM2
echo "🔧 Starting development server..."
pm2 start npm --name "singf-dev" -- run dev

# Save PM2 process list
pm2 save

# Display logs
echo ""
echo "✅ Development server started successfully!"
echo ""
echo "📊 Server Status:"
pm2 list

echo ""
echo "🌐 Application running at: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs singf-dev          - View logs"
echo "   pm2 stop singf-dev          - Stop server"
echo "   pm2 restart singf-dev       - Restart server"
echo "   pm2 monit                   - Monitor server"
echo ""
