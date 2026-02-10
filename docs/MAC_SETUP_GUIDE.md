# Artha-Mantra: Complete Mac Setup Guide

## Prerequisites Installation

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js
```bash
brew install node
```
Verify installation:
```bash
node --version  # Should be v16 or higher
npm --version
```

### 3. Install MongoDB
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### 4. Install Git (if not already installed)
```bash
brew install git
```

### 5. Install Docker (Optional - for containerized deployment)
Download Docker Desktop from https://www.docker.com/products/docker-desktop or:
```bash
brew install --cask docker
```

## Project Setup

### Method 1: Automated Setup (Recommended)

1. **Extract the project files** to your desired location
2. **Navigate to the project directory**:
   ```bash
   cd Artha-Mantra
   ```
3. **Run the automated setup script**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
4. **Configure environment variables**:
   ```bash
   nano backend/.env
   # or use any text editor like VS Code:
   code backend/.env
   ```

### Method 2: Manual Setup

1. **Navigate to backend directory and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Navigate to frontend directory and install dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

## Environment Configuration

Edit `backend/.env` file with the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/artha-mantra
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
JWT_EXPIRE=7d
PORT=5050
NODE_ENV=development

# API Keys (Get these from respective websites)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key  
NEWS_API_KEY=your_news_api_key

# Email (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Get API Keys:
- **Alpha Vantage**: Visit https://www.alphavantage.co/support/#api-key (Free)
- **Finnhub**: Visit https://finnhub.io/register (Free tier available)
- **News API**: Visit https://newsapi.org/register (Free tier available)

## Starting the Application

### Method 1: Development Mode (Recommended for development)

**Option A: Using the quick start script**:
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Option B: Manual start**:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend  
npm start
```

### Method 2: Using Docker

```bash
chmod +x scripts/start-docker.sh
./scripts/start-docker.sh
```

Or manually:
```bash
docker-compose up --build
```

## Access the Application

Once started, access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050
- **API Health Check**: http://localhost:5050/api/health

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:
   ```bash
   # Start MongoDB service
   brew services start mongodb-community

   # Check if MongoDB is running
   brew services list | grep mongodb
   ```

2. **Port Already in Use**:
   ```bash
   # Find process using port 3000 or 5050
   lsof -ti:3000
   lsof -ti:5050

   # Kill the process (replace PID with actual process ID)
   kill -9 PID
   ```

3. **Node Modules Issues**:
   ```bash
   # Clear npm cache and reinstall
   cd backend
   rm -rf node_modules package-lock.json
   npm install

   cd ../frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Permission Issues**:
   ```bash
   # Fix script permissions
   chmod +x scripts/*.sh
   ```

5. **MongoDB Not Starting**:
   ```bash
   # Uninstall and reinstall MongoDB
   brew services stop mongodb-community
   brew uninstall mongodb-community
   brew install mongodb-community
   brew services start mongodb-community
   ```

## Development Workflow

1. **Backend Development**:
   - Code is in `backend/src/`
   - API routes in `backend/src/routes/`
   - Database models in `backend/src/models/`
   - Server auto-restarts with nodemon

2. **Frontend Development**:
   - Code is in `frontend/src/`
   - React components in `frontend/src/components/`
   - Pages in `frontend/src/pages/`
   - Hot reload enabled

3. **Testing**:
   ```bash
   # Backend tests
   cd backend && npm test

   # Frontend tests  
   cd frontend && npm test
   ```

## Production Deployment

For production deployment:

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy using Docker**:
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

## Useful Commands

```bash
# View Docker logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# MongoDB shell access
mongosh

# Check running processes
ps aux | grep node
ps aux | grep mongod
```

## VS Code Extensions (Recommended)

Install these extensions for better development experience:
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer 2
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens
- Prettier - Code formatter

## Next Steps

1. Create your first user account
2. Set up a virtual portfolio
3. Start trading with virtual money
4. Explore AI-powered insights
5. Customize the platform for your needs

For any issues or questions, refer to the README.md file or check the troubleshooting section above.

Happy Trading! 🚀
