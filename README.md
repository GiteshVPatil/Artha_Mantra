# Artha-Mantra: AI-Driven Stock Trading Platform

## Overview
Artha-Mantra is an educational AI-powered stock trading simulator and portfolio management platform built with the MERN stack. It provides hands-on exposure to market dynamics in a risk-free environment while leveraging advanced AI for sentiment analysis and price prediction.

## Features
- **Virtual Trading Simulation**: Risk-free stock trading with real market data
- **AI-Powered Analytics**: Sentiment analysis and price prediction using LSTM/CNN models
- **Real-time Market Data**: Live stock prices and market updates via WebSocket
- **Portfolio Management**: Comprehensive portfolio tracking and performance analytics
- **Educational Focus**: Learn trading concepts without financial risk
- **Cloud-Based**: Deployed on Vercel with MongoDB Atlas

## Tech Stack
### Frontend
- React.js 18
- Redux Toolkit for state management
- Material-UI/Bootstrap for styling
- Chart.js for data visualization
- Socket.IO for real-time updates

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- WebSocket for real-time data
- RESTful API design

### AI/ML
- Python with TensorFlow/PyTorch
- LSTM/CNN models for price prediction
- NLP for sentiment analysis
- Financial news API integration

## Quick Start on Mac

### Prerequisites
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- MongoDB - [Install via Homebrew](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
- Git
- Python 3.8+ (for AI models)
- Docker (optional)

### Mac Installation Steps

1. **Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Node.js and MongoDB**:
```bash
brew install node mongodb-community
brew services start mongodb-community
```

3. **Clone the repository**:
```bash
git clone https://github.com/yourusername/artha-mantra.git
cd artha-mantra
```

4. **Run the setup script**:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

5. **Configure environment variables**:
```bash
cd backend
cp .env.example .env
# Edit .env file with your API keys and configuration
nano .env
```

6. **Start the development servers**:

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

7. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5050

### Alternative: Using Docker

1. **Install Docker Desktop**:
```bash
brew install --cask docker
```

2. **Start with Docker**:
```bash
docker-compose up --build
```

## API Keys Required

Get free API keys from:
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key
- **Finnhub**: https://finnhub.io/register
- **News API**: https://newsapi.org/register

Add these to your `backend/.env` file:
```
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

## Project Structure
```
artha-mantra/
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── services/      # Business logic
│   └── tests/             # Backend tests
├── ai-models/             # AI/ML models
│   ├── sentiment-analysis/
│   └── price-prediction/
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Check code style
```

### Frontend
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code style
```

## Deployment

### Using Docker
```bash
./scripts/deploy.sh
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Deploy backend to Heroku/Railway
3. Deploy frontend to Vercel/Netlify
4. Configure MongoDB Atlas

## Team
- Suyash Kutwal (C43335)
- Gunwant Patil (C43336)
- Devesh Patil (C43337)
- Samadhan Shewale (C43342)

**Guided By**: Prof. V. S. Paithankar

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support and questions, please create an issue in the GitHub repository.
