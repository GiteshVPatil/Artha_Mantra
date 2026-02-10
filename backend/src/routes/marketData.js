const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

// API Keys
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

// Cache for USD/INR rate
let cachedUsdInrRate = 83.5;
let lastRateFetch = 0;
const RATE_CACHE_DURATION = 3600000; // 1 hour

// NIFTY 50 stocks - with proper NSE suffixes
const NIFTY_50_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'WIPRO.NS', name: 'Wipro' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma' },
  { symbol: 'NESTLEIND.NS', name: 'Nestlé India' },
  { symbol: 'HINDUSTAN.NS', name: 'Hindustan Unilever' },
  { symbol: 'NTPC.NS', name: 'NTPC' },
  { symbol: 'ONGC.NS', name: 'ONGC' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
  { symbol: 'HPCL.NS', name: 'HPCL' },
  { symbol: 'BPCL.NS', name: 'BPCL' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
  { symbol: 'DMART.NS', name: 'Avenue Supermarts' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement' },
  { symbol: 'SHREECEM.NS', name: 'Shree Cement' },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports' },
  { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
  { symbol: 'ADANIPOWER.NS', name: 'Adani Power' },
  { symbol: 'ADANITRANS.NS', name: 'Adani Transmission' },
  { symbol: 'ZEEL.NS', name: 'Zee Entertainment' },
  { symbol: 'SBILIFE.NS', name: 'SBI Life' },
  { symbol: 'GAIL.NS', name: 'GAIL' },
  { symbol: 'INDIGO.NS', name: 'IndiGo' },
  { symbol: 'FEDERALBANK.NS', name: 'Federal Bank' },
];

// Helper: Get USD to INR rate
async function getUsdToInrRate() {
  const now = Date.now();
  if (now - lastRateFetch < RATE_CACHE_DURATION) {
    console.log(`💱 Using cached USD/INR rate: ${cachedUsdInrRate}`);
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
        console.log(`💱 Fetched fresh USD/INR rate: ${rate}`);
        return rate;
      }
    }
  } catch (error) {
    console.log('⚠️ Using fallback USD/INR rate:', cachedUsdInrRate);
  }
  return cachedUsdInrRate;
}

// ✅ FIXED: Fetch stock price with proper NSE symbol format
async function fetchStockPrice(symbol) {
  try {
    // Yahoo Finance API for NSE stocks
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
      {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );

    const meta = response.data?.chart?.result?.[0]?.meta;
    if (meta && meta.regularMarketPrice) {
      const price = parseFloat(meta.regularMarketPrice);
      const previousClose = parseFloat(meta.previousClose) || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol.replace('.NS', '').replace('.BO', ''),
        price,
        changePercent: changePercent.toFixed(2),
        change: change.toFixed(2),
        valid: true
      };
    }
  } catch (error) {
    console.log(`⚠️ Yahoo Finance failed for ${symbol}: ${error.message}`);
  }

  // Return invalid signal, NOT a demo price
  return { symbol: symbol.replace('.NS', '').replace('.BO', ''), valid: false };
}

// ✅ TOP PERFORMERS ENDPOINT
router.get('/top-performers', auth, async (req, res) => {
  try {
    console.log(`🔥 Fetching ${NIFTY_50_STOCKS.length} stocks for top performers`);

    // Fetch all stock prices in parallel
    const pricePromises = NIFTY_50_STOCKS.map(stock => fetchStockPrice(stock.symbol));
    const prices = await Promise.all(pricePromises);

    // Filter valid results and attach company names
    const validStocks = prices
      .filter(p => p.valid)
      .map((price, index) => {
        const stockInfo = NIFTY_50_STOCKS.find(s => s.symbol.includes(price.symbol));
        return {
          symbol: price.symbol,
          companyName: stockInfo?.name || price.symbol,
          currentPrice: price.price,
          todayChangePercent: parseFloat(price.changePercent),
          change: parseFloat(price.change)
        };
      });

    // Sort: top gainers (highest %) at top, losers at bottom
    const sorted = validStocks.sort((a, b) => b.todayChangePercent - a.todayChangePercent);

    // Split into gainers and losers
    const topPerformers = sorted.filter(s => s.todayChangePercent > 0).slice(0, 5);
    const bottomPerformers = sorted.filter(s => s.todayChangePercent < 0).slice(0, 5);

    console.log(`✅ Found ${topPerformers.length} top performers`);

    res.json({
      success: true,
      topPerformers,
      bottomPerformers,
      lastUpdated: new Date().toISOString(),
      dataCount: validStocks.length
    });
  } catch (error) {
    console.error('❌ Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      topPerformers: [],
      bottomPerformers: []
    });
  }
});

module.exports = router;
