#!/bin/bash
# Quick start script for IAM Service

echo "🚀 IAM Service Quick Start"
echo "=" | head -c 80 ; echo

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file from env.example"
    exit 1
fi

# Load environment
source .env

echo "📦 Building IAM Service..."
npm run build -- iam-service

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🚀 Starting IAM Service..."
echo "   Host: ${IAM_SERVICE_HOST:-127.0.0.1}"
echo "   Port: ${IAM_SERVICE_PORT:-3003}"
echo ""

# Start service
npm run start:prod iam-service

