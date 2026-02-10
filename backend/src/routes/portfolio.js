const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

const router = express.Router();
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

// ✅ Price caching to reduce API calls
const priceCache = new Map();
const PRICE_CACHE_DURATION = 60000; // 1 minute

let cachedUsdInrRate = 83.5;
let lastRateFetch = 0;
const RATE_CACHE_DURATION = 3600000; // 1 hour

async function getUsdToInrRate() {
  const now = Date.now();
  if (now - lastRateFetch < RATE_CACHE_DURATION) {
    return cachedUsdInrRate;
  }
  try {
    if (TWELVE_DATA_KEY) {
      const response = await axios.get(
        `https://api.twelvedata.com/price?symbol=USD/INR&apikey=${TWELVE_DATA_KEY}`,
        { timeout: 3000 }
      );
      const rate = parseFloat(response.data.price);
      if (rate && !isNaN(rate) && rate > 50 && rate < 100) {
        cachedUsdInrRate = rate;
        lastRateFetch = now;
        console.log(`💱 USD/INR rate: ${rate}`);
        return rate;
      }
    }
  } catch (error) {
    console.log('⚠️ Using fallback USD/INR rate:', cachedUsdInrRate);
  }
  return cachedUsdInrRate;
}

function needsUsdToInrConversion(symbol, currency) {
  const indianSuffixes = ['.NS', '.BO', '.BSE'];
  const isIndianStock = indianSuffixes.some(suffix => symbol.toUpperCase().includes(suffix));
  if (isIndianStock) return false;
  if (currency && currency.toUpperCase() === 'INR') return false;
  return true;
}

// ✅ CRITICAL FIX: Smart symbol normalization for NSE stocks
function normalizeSymbol(symbol) {
  // If already has exchange suffix, return as-is
  if (symbol.includes('.NS') || symbol.includes('.BO') || symbol.includes('.BSE')) {
    return symbol;
  }
  
  // Common NSE stocks - add .NS suffix
  const nseStocks = [
    'HDFCBANK', 'INFY', 'TCS', 'TATASTEEL', 'RELIANCE', 'SBIN', 'ICICIBANK',
    'WIPRO', 'ITC', 'BHARTIARTL', 'AXISBANK', 'KOTAKBANK', 'LT', 'HINDUNILVR',
    'BAJFINANCE', 'ASIANPAINT', 'MARUTI', 'TITAN', 'SUNPHARMA', 'ULTRACEMCO',
    'NESTLEIND', 'HCLTECH', 'TECHM', 'ONGC', 'NTPC', 'POWERGRID', 'JSWSTEEL',
    'GRASIM', 'ADANIPORTS', 'COALINDIA', 'TATAMOTORS', 'M&M', 'BAJAJFINSV',
    'DRREDDY', 'CIPLA', 'EICHERMOT', 'UPL', 'DIVISLAB', 'SHREECEM', 'BRITANNIA'
  ];
  
  const upperSymbol = symbol.toUpperCase();
  if (nseStocks.includes(upperSymbol)) {
    return `${symbol}.NS`;
  }
  
  // Default to NSE for Indian-sounding symbols
  return `${symbol}.NS`;
}

// ✅ Enhanced price fetching with proper symbol handling
async function fetchStockPrice(symbol) {
  const fxRate = await getUsdToInrRate();
  const yahooSymbol = normalizeSymbol(symbol);
  
  // Check cache first
  if (priceCache.has(yahooSymbol)) {
    const cached = priceCache.get(yahooSymbol);
    if (Date.now() - cached.timestamp < PRICE_CACHE_DURATION) {
      console.log(`📦 Cache hit for ${yahooSymbol}: ₹${cached.data.price.toFixed(2)}`);
      return cached.data;
    }
  }
  
  // Try Yahoo Finance first
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
      {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );
    const meta = response.data?.chart?.result?.[0]?.meta;
    if (meta && meta.regularMarketPrice) {
      let price = parseFloat(meta.regularMarketPrice);
      let currency = meta.currency || 'INR';
      
      // NSE stocks are already in INR
      if (currency !== 'INR' && needsUsdToInrConversion(yahooSymbol, currency)) {
        price = price * fxRate;
      }
      
      const stockData = {
        symbol: yahooSymbol,
        price,
        currency: 'INR',
        change: parseFloat(meta.regularMarketChange || 0),
        source: 'yahoo_finance',
        valid: true,
        timestamp: Date.now()
      };
      
      // Cache the result
      priceCache.set(yahooSymbol, { data: stockData, timestamp: Date.now() });
      console.log(`✅ Yahoo: ${yahooSymbol} = ₹${price.toFixed(2)}`);
      return stockData;
    }
  } catch (error) {
    console.log(`⚠️ Yahoo failed for ${yahooSymbol}: ${error.message}`);
  }
  
  // Fallback to TwelveData
  if (TWELVE_DATA_KEY) {
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(yahooSymbol)}&apikey=${TWELVE_DATA_KEY}`,
        { timeout: 5000 }
      );
      let price = parseFloat(response.data.price || response.data.close);
      let currency = response.data.currency || 'INR';
      if (price && !isNaN(price)) {
        if (currency !== 'INR' && needsUsdToInrConversion(yahooSymbol, currency)) {
          price = price * fxRate;
        }
        
        const stockData = {
          symbol: yahooSymbol,
          price,
          currency: 'INR',
          change: parseFloat(response.data.change || 0),
          source: 'twelve_data',
          valid: true,
          timestamp: Date.now()
        };
        
        priceCache.set(yahooSymbol, { data: stockData, timestamp: Date.now() });
        console.log(`✅ TwelveData: ${yahooSymbol} = ₹${price.toFixed(2)}`);
        return stockData;
      }
    } catch (error) {
      console.log(`⚠️ Twelve Data failed for ${yahooSymbol}: ${error.message}`);
    }
  }
  
  // All APIs failed
  console.warn(`❌ All APIs failed for ${yahooSymbol}, returning invalid`);
  return { symbol: yahooSymbol, valid: false };
}

async function updatePortfolioWithRealTimePrices(portfolio) {
  const failedSymbols = [];
  
  for (const holding of portfolio.holdings) {
    try {
      const stockData = await fetchStockPrice(holding.symbol);
      if (stockData.valid) {
        holding.currentPrice = stockData.price;
        holding.totalValue = holding.quantity * stockData.price;
        const costBasis = holding.quantity * holding.averagePrice;
        holding.profitLoss = holding.totalValue - costBasis;
        holding.profitLossPercentage = costBasis > 0 ? ((holding.profitLoss / costBasis) * 100) : 0;
        holding.lastUpdated = new Date();
        console.log(`✅ ${holding.symbol}: Updated ₹${stockData.price.toFixed(2)} | P&L: ₹${holding.profitLoss.toFixed(2)}`);
      } else {
        failedSymbols.push(holding.symbol);
        console.warn(`⚠️ ${holding.symbol}: Price fetch failed, using cached price`);
      }
    } catch (error) {
      failedSymbols.push(holding.symbol);
      console.error(`❌ Error updating ${holding.symbol}:`, error.message);
    }
  }
  
  // Recalculate portfolio totals
  const totalHoldingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.totalValue || 0), 0);
  portfolio.currentValue = portfolio.availableCash + totalHoldingsValue;
  portfolio.totalInvested = portfolio.initialAmount - portfolio.availableCash;
  portfolio.totalProfitLoss = portfolio.currentValue - portfolio.initialAmount;
  portfolio.totalProfitLossPercentage = portfolio.initialAmount > 0 ?
    ((portfolio.currentValue - portfolio.initialAmount) / portfolio.initialAmount) * 100 : 0;
  
  await portfolio.save();
  return portfolio;
}

// ============================================
// ROUTES
// ============================================

// Create portfolio
router.post('/', auth, async (req, res) => {
  try {
    const { name, initialAmount, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio name is required'
      });
    }
    if (!initialAmount || initialAmount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Initial amount must be at least ₹1,000'
      });
    }
    if (initialAmount > 100000000) {
      return res.status(400).json({
        success: false,
        message: 'Initial amount cannot exceed ₹10 Crore'
      });
    }
    const portfolio = await Portfolio.create({
      userId: req.user.id,
      name: name.trim(),
      initialAmount,
      availableCash: initialAmount,
      currentValue: initialAmount,
      description: description?.trim() || '',
      holdings: []
    });
    console.log(`✅ Portfolio created: ${portfolio.name}`);
    res.status(201).json({ success: true, portfolio });
  } catch (err) {
    console.error('❌ Portfolio creation error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all portfolios (no live prices - fast)
router.get('/', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, portfolios });
  } catch (err) {
    console.error('❌ Portfolio fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single portfolio (no live prices - fast)
router.get('/:id', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    res.json({ success: true, portfolio });
  } catch (err) {
    console.error('❌ Portfolio get error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get portfolio WITH live prices (called when "View Details" clicked)
router.get('/:id/details', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    
    console.log(`🔄 Fetching live prices for: ${portfolio.name} (${portfolio.holdings.length} holdings)`);
    
    // Fetch live prices with timeout protection
    const updatePromises = portfolio.holdings.map(holding =>
      Promise.race([
        fetchStockPrice(holding.symbol),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Price fetch timeout')), 8000))
      ]).then(stockData => {
        if (stockData.valid) {
          // Initialize averagePrice if not set
          if (!holding.averagePrice || holding.averagePrice <= 0) {
            holding.averagePrice = stockData.price;
          }
          holding.currentPrice = stockData.price;
          holding.totalValue = holding.quantity * stockData.price;
          const costBasis = holding.quantity * holding.averagePrice;
          holding.profitLoss = holding.totalValue - costBasis;
          holding.profitLossPercentage = costBasis > 0 ? ((holding.profitLoss / costBasis) * 100) : 0;
          holding.lastUpdated = new Date();
          console.log(`✅ ${holding.symbol}: ₹${stockData.price.toFixed(2)} | P&L: ₹${holding.profitLoss.toFixed(2)}`);
        } else {
          console.warn(`⚠️ ${holding.symbol}: Price fetch failed, using cached prices`);
        }
      }).catch(error => {
        console.warn(`⚠️ Failed to update ${holding.symbol}: ${error.message}, using cached price`);
      })
    );
    
    await Promise.all(updatePromises);
    
    // Recalculate totals
    const totalHoldingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.totalValue || 0), 0);
    portfolio.currentValue = portfolio.availableCash + totalHoldingsValue;
    portfolio.totalInvested = portfolio.initialAmount - portfolio.availableCash;
    portfolio.totalProfitLoss = portfolio.currentValue - portfolio.initialAmount;
    portfolio.totalProfitLossPercentage = portfolio.initialAmount > 0 
      ? ((portfolio.currentValue - portfolio.initialAmount) / portfolio.initialAmount) * 100
      : 0;
    
    await portfolio.save();
    console.log(`✅ Portfolio "${portfolio.name}" updated | Value: ₹${portfolio.currentValue.toFixed(2)} | P&L: ₹${portfolio.totalProfitLoss.toFixed(2)}`);
    
    res.json({ success: true, portfolio });
  } catch (err) {
    console.error('❌ Portfolio details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get holdings
router.get('/:id/holdings', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    res.json({ success: true, holdings: portfolio.holdings });
  } catch (err) {
    console.error('❌ Holdings fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update portfolio
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (name && !name.trim())
      return res.status(400).json({ success: false, message: 'Portfolio name cannot be empty' });
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        name: name?.trim() || undefined,
        description: description?.trim() || undefined
      },
      { new: true }
    );
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    console.log(`✅ Portfolio updated: ${portfolio.name}`);
    res.json({ success: true, portfolio });
  } catch (err) {
    console.error('❌ Portfolio update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete portfolio
router.delete('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    console.log(`✅ Portfolio deleted: ${portfolio.name}`);
    res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (err) {
    console.error('❌ Portfolio delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
