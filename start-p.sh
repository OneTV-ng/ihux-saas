#!/bin/bash

# Start Production Server Script
# This script builds and starts the Next.js production server using PM2

echo "🚀 Starting DXL Music HUB in PRODUCTION mode..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "📋 Checking for existing processes..."
pm2 delete singf-prod 2>/dev/null || true

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build the application
echo "🔨 Building production application..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Start production server with PM2
echo "🚀 Starting production server..."
pm2 start npm --name "singf-prod" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
echo "⚙️  Setting up PM2 to start on boot..."
pm2 startup

# Display logs
echo ""
echo "✅ Production server started successfully!"
echo ""
echo "📊 Server Status:"
pm2 list

echo ""
echo "🌐 Application running at: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs singf-prod         - View logs"
echo "   pm2 stop singf-prod         - Stop server"
echo "   pm2 restart singf-prod      - Restart server"
echo "   pm2 monit                   - Monitor server"
echo "   pm2 save                    - Save process list"
echo ""
echo "⚠️  Remember to set production environment variables in .env.local"
echo ""
