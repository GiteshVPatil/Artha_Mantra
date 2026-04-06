const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Trading = require('../models/Trading');
const Portfolio = require('../models/Portfolio');
const { getCachedStocks } = require('../utils/nseStocksCache');
const { analyzeTrade } = require('../services/aiService'); // ✅ AI SERVICE ADDED

const router = express.Router();
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

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
      if (rate && !isNaN(rate) && rate > 70 && rate < 100) {
        cachedUsdInrRate = rate;
        lastRateFetch = now;
        console.log(`💱 USD/INR rate updated: ${rate}`);
        return rate;
      }
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch USD/INR rate, using cache:', cachedUsdInrRate);
  }
  return cachedUsdInrRate;
}

/* ========== STOCK SEARCH ========== */
router.get('/search/:query', auth, async (req, res) => {
  const { query } = req.params;
  let results = [];
  try {
    if (!query || query.trim().length === 0) {
      return res.json({ success: true, results: [], count: 0 });
    }
    const searchTerm = query.toLowerCase().trim();
    const nseStocks = getCachedStocks();
    results = nseStocks
      .filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm) ||
        stock.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);

    // Supplement with global API if needed
    if (results.length < 10 && TWELVE_DATA_KEY) {
      try {
        const response = await axios.get(
          `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${TWELVE_DATA_KEY}`,
          { timeout: 5000 }
        );
        if (response.data && response.data.data) {
          const extras = response.data.data
            .filter(globalStock =>
              globalStock.symbol &&
              !results.some(r => r.symbol === globalStock.symbol)
            )
            .map(globalStock => ({
              symbol: globalStock.symbol,
              name: globalStock.instrument_name,
              exchange: globalStock.exchange,
              region: globalStock.country || globalStock.region || "Global",
              currency: "INR"
            }));
          results = results.concat(extras.slice(0, 10 - results.length));
        }
      } catch (apiError) {
        console.log('⚠️ Twelve Data symbol search failed:', apiError.message);
      }
    }

    res.json({
      success: true,
      results,
      count: results.length,
      source: results.length ? (results[0].region === "India" ? "nse+global" : "global") : "none"
    });
  } catch (error) {
    console.error('❌ Stock search error:', error);
    res.status(500).json({ success: false, results: [], message: 'Search failed' });
  }
});

/* ========== REAL-TIME PRICE: NO FAKE/DEMO ========== */
router.get('/price/:symbol', auth, async (req, res) => {
  const { symbol } = req.params;
  let price = null;
  let currency = 'INR';
  let source = '';
  try {
    // Try Yahoo Finance first
    try {
      const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );
      const result = response.data?.chart?.result?.[0];
      const meta = result?.meta;
      if (meta && meta.regularMarketPrice) {
        price = parseFloat(meta.regularMarketPrice);
        currency = meta.currency || 'INR';
        source = 'yahoo_finance';
        if (currency === 'USD') {
          const fxRate = await getUsdToInrRate();
          price = price * fxRate;
          currency = 'INR';
          console.log(`💱 Converted ${symbol} from USD: $${meta.regularMarketPrice} × ${fxRate} = ₹${price.toFixed(2)}`);
        }
        if (price && price > 0) {
          console.log(`✅ Price from Yahoo Finance for ${symbol}: ₹${price.toFixed(2)} (${source})`);
          return res.json({
            success: true,
            symbol: symbol.toUpperCase(),
            price,
            currency,
            change: parseFloat(meta.regularMarketChange || 0),
            changePercent: parseFloat(meta.regularMarketChangePercent || 0),
            high: parseFloat(meta.regularMarketDayHigh || 0),
            low: parseFloat(meta.regularMarketDayLow || 0),
            open: parseFloat(meta.regularMarketOpen || 0),
            previousClose: parseFloat(meta.chartPreviousClose || 0),
            timestamp: new Date().toISOString(),
            source
          });
        }
      }
    } catch (yahooError) {
      console.log(`⚠️ Yahoo Finance failed for ${symbol}: ${yahooError.message}`);
    }
    // Fallback to Twelve Data
    if (TWELVE_DATA_KEY) {
      try {
        console.log(`🔄 Trying Twelve Data for ${symbol}...`);
        const response = await axios.get(
          `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVE_DATA_KEY}`,
          { timeout: 5000 }
        );
        const data = response.data;
        price = parseFloat(data.price || data.close);
        currency = data.currency || 'USD';
        if (price && !isNaN(price) && price > 0) {
          if (currency !== 'INR') {
            const fxRate = await getUsdToInrRate();
            price = price * fxRate;
            currency = 'INR';
            console.log(`💱 Converted ${symbol} from ${data.currency}: ${data.price} × ${fxRate} = ₹${price.toFixed(2)}`);
          }
          console.log(`✅ Price from Twelve Data for ${symbol}: ₹${price.toFixed(2)}`);
          return res.json({
            success: true,
            symbol: symbol.toUpperCase(),
            price,
            currency,
            change: parseFloat(data.change || 0),
            changePercent: parseFloat(data.percent_change || 0),
            timestamp: new Date().toISOString(),
            source: 'twelve_data'
          });
        }
      } catch (twelveError) {
        console.log(`⚠️ Twelve Data failed for ${symbol}: ${twelveError.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in price fetch:', error);
  }
  // Final fallback: SAFELY RETURN 0, NOT RANDOM
  console.log(`⚠️ All APIs failed for ${symbol}, returning price = 0`);
  res.json({
    success: true,
    symbol: symbol.toUpperCase(),
    price: 0,          // <--- NO random/fake price ever
    currency: 'INR',
    change: 0,
    changePercent: 0,
    timestamp: new Date().toISOString(),
    source: 'api_fail'
  });
});

/* ========== HELPER: UPDATE PORTFOLIO AFTER TRADE (FIXED P&L CALCULATION) ========== */
async function updatePortfolioAfterTrade(portfolio, trade) {
  const { symbol, companyName, type, quantity, price } = trade;

  // ✅ VALIDATE inputs
  if (!quantity || quantity <= 0 || !price || price <= 0) {
    throw new Error(`Invalid trade data: quantity=${quantity}, price=${price}`);
  }

  if (type === 'BUY') {
    portfolio.availableCash -= trade.totalAmount;
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
      // ✅ CORRECT: Calculate new average price
      const totalQuantity = existingHolding.quantity + quantity;
      const totalCost = (existingHolding.averagePrice * existingHolding.quantity) + (price * quantity);
      const newAveragePrice = totalCost / totalQuantity;

      existingHolding.quantity = totalQuantity;
      existingHolding.averagePrice = newAveragePrice;
      existingHolding.currentPrice = price;
      existingHolding.totalValue = totalQuantity * price;

      // ✅ CORRECT P&L CALCULATION
      const costBasis = totalQuantity * newAveragePrice;
      existingHolding.profitLoss = existingHolding.totalValue - costBasis;
      existingHolding.profitLossPercentage = costBasis > 0 ? ((existingHolding.profitLoss / costBasis) * 100) : 0;
      existingHolding.lastUpdated = new Date();

      console.log(`✅ BUY (ADD): ${quantity} ${symbol} @ ₹${price.toFixed(2)}`);
      console.log(`   New quantity: ${totalQuantity}, New avg: ₹${newAveragePrice.toFixed(2)}`);
    } else {
      // ✅ NEW HOLDING
      portfolio.holdings.push({
        symbol,
        companyName: companyName || symbol,
        quantity,
        averagePrice: price,
        currentPrice: price,
        totalValue: quantity * price,
        profitLoss: 0,
        profitLossPercentage: 0,
        lastUpdated: new Date()
      });

      console.log(`✅ BUY (NEW): ${quantity} ${symbol} @ ₹${price.toFixed(2)}`);
    }
  } else if (type === 'SELL') {
    portfolio.availableCash += trade.totalAmount;
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
      const costOfSoldShares = quantity * existingHolding.averagePrice;
      const revenueFromSale = quantity * price;
      const profitOnSale = revenueFromSale - costOfSoldShares;
     
      trade.realizedProfit = profitOnSale;
      trade.profitPercentage = costOfSoldShares > 0
        ? (profitOnSale / costOfSoldShares) * 100
        : 0;

      await trade.save();


      console.log(`✅ SELL: ${quantity} ${symbol} @ ₹${price.toFixed(2)}`);
      console.log(`   Cost basis: ₹${costOfSoldShares.toFixed(2)}, Revenue: ₹${revenueFromSale.toFixed(2)}, Profit: ₹${profitOnSale.toFixed(2)}`);

      existingHolding.quantity -= quantity;

      if (existingHolding.quantity <= 0) {
        portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
        console.log(`✅ Removed ${symbol} from holdings (all shares sold)`);
      } else {
        existingHolding.currentPrice = price;
        existingHolding.totalValue = existingHolding.quantity * existingHolding.currentPrice;

        const costBasis = existingHolding.quantity * existingHolding.averagePrice;
        existingHolding.profitLoss = existingHolding.totalValue - costBasis;
        existingHolding.profitLossPercentage = costBasis > 0 ? ((existingHolding.profitLoss / costBasis) * 100) : 0;
        existingHolding.lastUpdated = new Date();

        console.log(`✅ Remaining: ${existingHolding.quantity} ${symbol} @ avg ₹${existingHolding.averagePrice.toFixed(2)}`);
      }
    }
  }

  // ✅ RECALCULATE PORTFOLIO TOTALS
  const totalHoldingsValue = portfolio.holdings.reduce((sum, holding) => {
    return sum + (holding.totalValue || 0);
  }, 0);

  portfolio.currentValue = portfolio.availableCash + totalHoldingsValue;
  portfolio.totalInvested = portfolio.initialAmount - portfolio.availableCash;
  portfolio.totalProfitLoss = portfolio.currentValue - portfolio.initialAmount;
  portfolio.totalProfitLossPercentage = portfolio.initialAmount > 0
    ? ((portfolio.totalProfitLoss / portfolio.initialAmount) * 100)
    : 0;

  await portfolio.save();
  console.log(`✅ Portfolio saved: ${portfolio.name}`);
  console.log(`   Current Value: ₹${portfolio.currentValue.toFixed(2)}`);
  console.log(`   Total P&L: ₹${portfolio.totalProfitLoss.toFixed(2)} (${portfolio.totalProfitLossPercentage.toFixed(2)}%)`);
}

/* ========== EXECUTE TRADE ========== */
router.post('/execute', auth, async (req, res) => {
  try {
    const { portfolioId, symbol, companyName, type, quantity, price, orderType } = req.body;

    if (!portfolioId || !symbol || !type || !quantity || price === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price);

    if (parsedQuantity <= 0 || isNaN(parsedQuantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    if (parsedPrice <= 0 || isNaN(parsedPrice)) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid order type' });
    }

    const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const totalAmount = parsedQuantity * parsedPrice;

    // ================= BUY VALIDATION =================
    if (type === 'BUY') {
      if (portfolio.availableCash < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient funds. Available: ₹${portfolio.availableCash.toFixed(2)}, Required: ₹${totalAmount.toFixed(2)}`
        });
      }
    }

    // ================= SELL VALIDATION =================
    let holdingBeforeSell = null;

    if (type === 'SELL') {
      holdingBeforeSell = portfolio.holdings.find(h => h.symbol === symbol);

      if (!holdingBeforeSell || holdingBeforeSell.quantity < parsedQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient shares. You ${holdingBeforeSell ? `only have ${holdingBeforeSell.quantity}` : 'do not own any'} shares of ${symbol}`
        });
      }
    }

    // ================= CREATE TRADE RECORD =================
    const trade = await Trading.create({
      userId: req.user.id,
      portfolioId,
      symbol: symbol.toUpperCase(),
      companyName: companyName || symbol,
      type,
      orderType: orderType || 'MARKET',
      quantity: parsedQuantity,
      price: parsedPrice,
      totalAmount,
      status: 'EXECUTED',
      executedAt: new Date(),
      executedPrice: parsedPrice
    });

    // ================= AI ANALYSIS ONLY FOR CLOSED SELL =================
    let aiAnalysisText = null;

    if (type === 'SELL' && holdingBeforeSell) {
      try {
        const entryPrice = holdingBeforeSell.averagePrice;
        const exitPrice = parsedPrice;

        const aiResult = await analyzeTrade({
          stock: symbol.toUpperCase(),
          entry_price: entryPrice,
          exit_price: exitPrice,
          quantity: parsedQuantity,
          rsi: 50,
          macd: 0,
          volume: 0,
          sentiment: "Neutral"
        });

        aiAnalysisText = aiResult.analysis;

        trade.aiAnalysis = aiAnalysisText;
        await trade.save();

        console.log(`🤖 AI Analysis Generated for ${symbol}`);
      } catch (aiError) {
        console.error("AI Integration Error:", aiError.message);
      }
    }

    // ================= UPDATE PORTFOLIO =================
    await updatePortfolioAfterTrade(portfolio, trade);
    const updatedPortfolio = await Portfolio.findById(portfolioId);

    res.status(201).json({
      success: true,
      trade,
      portfolio: updatedPortfolio,
      message: `${type} order executed successfully!`
    });

  } catch (err) {
    console.error('❌ Trade execution error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});


/* ========== GET USER'S HOLDINGS FOR SELL ORDERS ========== */
router.get('/holdings/:portfolioId', auth, async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const holdings = portfolio.holdings
      .filter(h => h.quantity > 0)
      .map(h => ({
        symbol: h.symbol,
        companyName: h.companyName,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice: h.currentPrice || h.averagePrice
      }));

    res.json({ success: true, holdings });
  } catch (error) {
    console.error('❌ Holdings fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holdings' });
  }
});

/* ========== TRADE HISTORY ========== */
router.get('/history', auth, async (req, res) => {
  try {
    const { portfolioId, limit = 50, page = 1 } = req.query;
    const query = { userId: req.user.id };
    if (portfolioId) query.portfolioId = portfolioId;

    const trades = await Trading.find(query)
      .sort({ createdAt: -1 })
      .limit(+limit)
      .skip((page - 1) * limit);

    const total = await Trading.countDocuments(query);

    res.json({
      success: true,
      trades,
      pagination: { current: +page, pages: Math.ceil(total / limit), total }
    });
  } catch (err) {
    console.error('❌ Trade history error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
