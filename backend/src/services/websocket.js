const { Server } = require('socket.io');

let io;

// 🔧 ENHANCEMENT: NSE stocks list instead of US stocks
const NSE_STOCKS = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'HDFC BANK', 'WIPRO', 'MARUTI', 
                    'SBIN', 'ICICI BANK', 'AXIS BANK', 'LT', 'SUNPHARMA', 'NESTLEIND', 
                    'ITC', 'BAJAJ AUTO', 'BHARTI AIRTEL', 'TITAN', 'HUL', 'M&M', 'POWERGRID'];

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Subscribe to stock updates
    socket.on('subscribe_stock', (symbol) => {
      socket.join(`stock_${symbol}`);
      console.log(`📈 Client ${socket.id} subscribed to ${symbol}`);
    });

    // Subscribe to portfolio updates
    socket.on('subscribe_portfolio', (portfolioId) => {
      socket.join(`portfolio_${portfolioId}`);
      console.log(`📊 Client ${socket.id} subscribed to portfolio ${portfolioId}`);
    });

    // Unsubscribe from stock updates
    socket.on('unsubscribe_stock', (symbol) => {
      socket.leave(`stock_${symbol}`);
      console.log(`📉 Client ${socket.id} unsubscribed from ${symbol}`);
    });

    // Unsubscribe from portfolio updates
    socket.on('unsubscribe_portfolio', (portfolioId) => {
      socket.leave(`portfolio_${portfolioId}`);
      console.log(`📊 Client ${socket.id} unsubscribed from portfolio ${portfolioId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // 🔧 ENHANCEMENT: Simulate real-time NSE stock price updates with realistic data
  setInterval(() => {
    NSE_STOCKS.forEach(symbol => {
      // Generate realistic price change (±2% variation)
      const basePrice = Math.random() * 3000 + 100; // Random price 100-3100
      const changePercent = (Math.random() * 4 - 2); // -2% to +2%
      const change = (basePrice * changePercent) / 100;

      const mockPriceUpdate = {
        symbol: `${symbol}.NS`,
        price: basePrice,
        change: change,
        changePercent: changePercent.toFixed(2),
        timestamp: new Date(),
        source: 'mock_nse'
      };

      // Broadcast to all clients subscribed to this stock
      io.to(`stock_${symbol}.NS`).emit('price_update', mockPriceUpdate);
    });
  }, 5000); // Update every 5 seconds

  console.log('✅ WebSocket initialized with NSE stocks');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// 🔧 ENHANCEMENT: Helper function to emit portfolio updates
const emitPortfolioUpdate = (portfolioId, portfolioData) => {
  if (io) {
    io.to(`portfolio_${portfolioId}`).emit('portfolio_updated', {
      portfolioId,
      ...portfolioData,
      timestamp: new Date()
    });
  }
};

module.exports = { initializeWebSocket, getIO, emitPortfolioUpdate };
