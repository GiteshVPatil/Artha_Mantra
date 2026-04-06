const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const portfolioRoutes = require('./routes/portfolio');
const tradingRoutes = require('./routes/trading');
const marketDataRoutes = require('./routes/marketData');
const aiRoutes = require('./routes/ai');
const marketSignalsRoute = require('./routes/marketSignals');
const aiChatbotRoute = require('./routes/aiChatbot');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');
const aiAnalyticsRoutes = require("./routes/aiAnalytics");


const { connectDB } = require('./config/database');
const { initializeWebSocket } = require('./services/websocket');
const errorHandler = require('./middleware/errorHandler');

// ===== ✅ NEW: Import NSE Stock Cache Utility =====
const { initializeCache, fetchAndCacheNSEStocks } = require('./utils/nseStocksCache');

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();

// ===== ✅ NEW: Initialize NSE Stock Cache =====
console.log('🔄 Initializing NSE Stock Cache...');
initializeCache()
  .then(() => {
    console.log('✅ NSE Stock Cache initialized successfully');
  })
  .catch(err => {
    console.error('❌ Failed to initialize NSE Stock Cache:', err.message);
    console.log('⚠️ App will continue, but stock search may be limited');
  });

// ===== ✅ NEW: Auto-refresh NSE Cache every 24 hours =====
setInterval(() => {
  console.log('🔄 Auto-refreshing NSE Stock Cache (daily update)...');
  fetchAndCacheNSEStocks()
    .then(() => console.log('✅ NSE Cache refreshed'))
    .catch(err => console.error('❌ Cache refresh failed:', err.message));
}, 24 * 60 * 60 * 1000); // Every 24 hours

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Artha-Mantra API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      nseStockCache: 'enabled',
      autoRefresh: '24h'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market-signals', marketSignalsRoute);
app.use('/api/ai-chatbot', aiChatbotRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
//app.use('/api/market', require('./routes/marketData'));
app.use("/api/ai", aiAnalyticsRoutes);
app.use("/api/market", require("./routes/market"));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Artha-Mantra Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📈 NSE Stock Cache: Active`);
  console.log(`🔄 Auto-refresh: Every 24 hours`);
  console.log('='.repeat(60));
});

// Initialize WebSocket
initializeWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
