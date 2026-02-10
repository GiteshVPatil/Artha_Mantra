#!/bin/bash

# Artha-Mantra Setup Script for Mac
echo "🚀 Setting up Artha-Mantra Trading Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📥 Installing Node.js via Homebrew..."

    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "📥 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    brew install node
else
    echo "✅ Node.js is installed: $(node --version)"
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "📥 Installing MongoDB via Homebrew..."
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
else
    echo "✅ MongoDB is installed"
    # Start MongoDB if not running
    brew services start mongodb-community
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root directory
cd ..

# Copy environment file
echo "⚙️  Setting up environment variables..."
cp backend/.env.example backend/.env
echo "✅ Environment file created at backend/.env"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update backend/.env with your configuration"
echo "   2. Get API keys for:"
echo "      - Alpha Vantage: https://www.alphavantage.co/support/#api-key"
echo "      - Finnhub: https://finnhub.io/register"  
echo "      - News API: https://newsapi.org/register"
echo "   3. Start the development servers:"
echo "      - Backend: cd backend && npm run dev"
echo "      - Frontend: cd frontend && npm start"
echo "   4. Or use Docker: docker-compose up"
echo ""
echo "🌐 Application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5050"
echo ""
echo "📖 For detailed setup instructions, see README.md"
