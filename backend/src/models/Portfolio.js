const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0  // ✅ ADDED: Prevent negative prices
  },
  totalValue: {
    type: Number,
    default: 0
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  profitLossPercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Portfolio name is required'],
    trim: true,
    maxlength: [100, 'Portfolio name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  initialAmount: {
    type: Number,
    required: true,
    min: [1000, 'Initial amount must be at least ₹1,000'],
    default: 100000
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0  // ✅ ADDED: Prevent negative values
  },
  availableCash: {
    type: Number,
    default: 0,
    min: 0  // ✅ ADDED: Prevent negative values
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  totalProfitLoss: {
    type: Number,
    default: 0
  },
  totalProfitLossPercentage: {
    type: Number,
    default: 0
  },
  holdings: [holdingSchema],
  performance: {
    dailyReturn: {
      type: Number,
      default: 0
    },
    weeklyReturn: {
      type: Number,
      default: 0
    },
    monthlyReturn: {
      type: Number,
      default: 0
    },
    yearlyReturn: {
      type: Number,
      default: 0
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ FIXED: Better presave hook with validation
portfolioSchema.pre('save', function(next) {
  try {
    // ✅ RECALCULATE based on EXISTING data only
    // Do NOT override values calculated in updatePortfolioAfterTrade()
    
    let totalHoldingsValue = 0;
    
    // Calculate holdings value correctly
    for (const holding of this.holdings) {
      if (holding.quantity > 0 && holding.currentPrice > 0) {
        holding.totalValue = holding.quantity * holding.currentPrice;
        totalHoldingsValue += holding.totalValue;
      } else {
        holding.totalValue = 0;
      }
    }

    // ✅ Calculate portfolio totals (if not already set)
    // Only recalculate if values seem invalid
    if (this.currentValue === 0 || this.currentValue === undefined) {
      this.currentValue = (this.availableCash || 0) + totalHoldingsValue;
    }

    if (this.totalInvested === 0 || this.totalInvested === undefined) {
      this.totalInvested = (this.initialAmount || 0) - (this.availableCash || 0);
    }

    if (this.totalProfitLoss === 0 || this.totalProfitLoss === undefined) {
      this.totalProfitLoss = this.currentValue - (this.initialAmount || 0);
    }

    // ✅ Only recalculate P&L % if needed
    if (this.initialAmount > 0) {
      if (this.totalProfitLossPercentage === 0 || this.totalProfitLossPercentage === undefined) {
        this.totalProfitLossPercentage = 
          ((this.currentValue - this.initialAmount) / this.initialAmount) * 100;
      }
    }

    // ✅ Ensure availableCash doesn't go negative
    if (this.availableCash < 0) {
      console.warn(`⚠️ WARNING: availableCash is negative (₹${this.availableCash.toFixed(2)}). This should not happen.`);
      this.availableCash = 0;
    }

    // ✅ Ensure currentValue >= 0
    if (this.currentValue < 0) {
      console.warn(`⚠️ WARNING: currentValue is negative (₹${this.currentValue.toFixed(2)}). This should not happen.`);
      this.currentValue = 0;
    }

    console.log(`✅ Portfolio pre-save validation passed`);
    console.log(`   Current Value: ₹${this.currentValue.toFixed(2)}`);
    console.log(`   Available Cash: ₹${this.availableCash.toFixed(2)}`);
    console.log(`   Total P&L: ₹${this.totalProfitLoss.toFixed(2)} (${this.totalProfitLossPercentage.toFixed(2)}%)`);

    next();
  } catch (error) {
    console.error('❌ Error in portfolio pre-save hook:', error);
    next(error);
  }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
