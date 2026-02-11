const mongoose = require('mongoose');

const tradingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP_LOSS'],
    default: 'MARKET'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING'
  },
  executedAt: {
    type: Date
  },
  executedPrice: {
    type: Number
  },
  fees: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    maxlength: 200
  }, realizedProfit: {
    type: Number,
    default: 0
  },
  profitPercentage: {
    type: Number,
    default: 0
  },
  aiAnalysis: {
    type: String
  }

},
  {
    timestamps: true
  });

// Index for efficient querying
tradingSchema.index({ userId: 1, portfolioId: 1, createdAt: -1 });
tradingSchema.index({ symbol: 1, createdAt: -1 });
tradingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Trading', tradingSchema);
