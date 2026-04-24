#!/bin/bash

# Bazooka Backend Setup Script
# Usage: ./scripts/setup.sh

set -e

echo "🔧 Setting up BAZOOKA backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set your secrets:"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - DATABASE_URL (from Neon.tech)"
    echo "   - CLOUDINARY_CLOUD_NAME"
    echo "   - CLOUDINARY_API_KEY"
    echo "   - CLOUDINARY_API_SECRET"
    echo ""
    echo "Then run: npm install"
else
    echo "✅ .env exists"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your actual credentials"
echo "2. Start servers:"
echo "   - Backend: npm start"
echo "   - Frontend: cd ../frontend && python3 -m http.server 3000"
echo ""
echo "Or use Docker Compose for PostgreSQL:"
echo "   docker-compose up -d postgres"
