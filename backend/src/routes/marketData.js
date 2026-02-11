const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 👈 ALL YOUR API KEYS
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

// 👈 USD/INR CURRENCY CONVERTER
let cachedUsdInrRate = 83.50;
let lastRateFetch = 0;
const RATE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function getUsdToInrRate() {
  const now = Date.now();
  if (now - lastRateFetch < RATE_CACHE_DURATION) {
    return cachedUsdInrRate;
  }

  try {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD`,
      { timeout: 5000 }
    );
    
    const rate = response.data.rates.INR;
    if (rate && rate > 80 && rate < 90) {
      cachedUsdInrRate = rate;
      lastRateFetch = now;
      console.log(`💱 Fresh USD→INR: ${rate}`);
      return rate;
    }
  } catch (error) {
    console.log('⚠️ Using cached USD/INR rate');
  }
  return cachedUsdInrRate;
}

async function convertToInr(price, currency = 'USD') {
  if (currency === 'INR') return price;
  const rate = await getUsdToInrRate();
  return price * rate;
}

// Cache
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 min

// NIFTY 50 stocks (for top-performers)
const NIFTY_50_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
];

// Common stocks for search fallback
const COMMON_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE' },
  { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ' },
];

// 🔍 UNIVERSAL SEARCH - ALL APIs
router.get('/search/:query', auth, async (req, res) => {
  const { query } = req.params;
  const cacheKey = `search:${query.toLowerCase()}`;
  
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  try {
    let results = [];
    
    // 1. TwelveData Search (best)
    if (TWELVE_DATA_KEY) {
      try {
        const resp = await axios.get(
          `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${TWELVE_DATA_KEY}&exchange=NSE,NASDAQ,NYSE`,
          { timeout: 3000 }
        );
        results = resp.data.data?.slice(0, 10) || [];
        if (results.length > 0) {
          console.log(`✅ TwelveData found ${results.length} for "${query}"`);
        }
      } catch (e) {
        console.log('TwelveData search failed, trying fallback...');
      }
    }

    // 2. Fallback: Common stocks filter
    if (results.length === 0) {
      results = COMMON_STOCKS
        .filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(stock => ({
          symbol: stock.symbol.includes('.NS') ? stock.symbol.replace('.NS', '') : stock.symbol,
          name: stock.name,
          exchange: stock.exchange
        }));
    }

    const response = { success: true, results, count: results.length };
    cache.set(cacheKey, response);
    setTimeout(() => cache.delete(cacheKey), CACHE_DURATION);
    res.json(response);
  } catch (error) {
    res.json({ success: true, results: [], count: 0 });
  }
});

// 💰 UNIVERSAL QUOTE - Multi-API Fallback
router.get('/quote/:symbol', auth, async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `quote:${symbol}`;
  
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  const fullSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
  
  const apis = [
    () => yahooQuote(fullSymbol),
    () => twelveDataQuote(symbol),
    () => alphaVantageQuote(symbol),
    () => finnhubQuote(symbol)
  ];

  for (const api of apis) {
    try {
      const quote = await api();
      if (quote.valid) {
        const response = {
          success: true,
          quote: {
            symbol: symbol.toUpperCase(),
            companyName: quote.name || `${symbol.toUpperCase()} Stock`,
            currentPrice: quote.price,
            change: quote.change || 0,
            changePercent: quote.changePercent || 0,
            currency: 'INR',  // 👈 ALWAYS INR
            exchange: quote.exchange || 'NSE',
            volume: quote.volume || 0,
            marketCap: quote.marketCap || 0
          },
          source: quote.source
        };
        cache.set(cacheKey, response);
        setTimeout(() => cache.delete(cacheKey), CACHE_DURATION);
        return res.json(response);
      }
    } catch (e) {
      console.log(`${api.name} failed for ${symbol}`);
    }
  }

  res.status(404).json({ success: false, quote: null, message: 'No data available' });
});

// 📈 UNIVERSAL HISTORY - Multi-API Fallback  
router.get('/history/:symbol', auth, async (req, res) => {
  const { symbol } = req.params;
  const { period = '1M' } = req.query;
  const cacheKey = `history:${symbol}:${period}`;
  
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  const fullSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
  const rangeMap = { '1W': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y' };
  const range = rangeMap[period] || '1mo';

  const apis = [
    () => yahooHistory(fullSymbol, range),
    () => twelveDataHistory(symbol, period),
    () => alphaVantageHistory(symbol)
  ];

  for (const api of apis) {
    try {
      const history = await api();
      if (history.length > 0) {
        const response = {
          success: true,
          history,
          count: history.length,
          currency: 'INR',  // 👈 ALWAYS INR
          source: 'Multi-API (INR)'
        };
        cache.set(cacheKey, response);
        setTimeout(() => cache.delete(cacheKey), CACHE_DURATION);
        return res.json(response);
      }
    } catch (e) {
      console.log(`${api.name} failed for ${symbol}`);
    }
  }

  res.status(404).json({ success: false, history: [], message: 'No historical data' });
});

// API IMPLEMENTATIONS - ALL CONVERTED TO INR
async function yahooQuote(symbol) {
  try {
    const resp = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d`,
      { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const meta = resp.data?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice != null) {
      let price = parseFloat(meta.regularMarketPrice);
      const prev = parseFloat(meta.previousClose) || price;
      const currency = meta.currency || 'USD';
      
      price = await convertToInr(price, currency);
      const change = await convertToInr(price - prev, currency);
      
      return {
        valid: true,
        price, 
        change, 
        changePercent: ((price - prev) / prev * 100),
        name: meta.symbol, 
        currency: 'INR', 
        exchange: meta.exchange || 'NSE',
        source: 'Yahoo (INR)'
      };
    }
  } catch (e) {
    console.log(`Yahoo quote failed: ${e.message}`);
  }
  return { valid: false };
}

async function twelveDataQuote(symbol) {
  if (!TWELVE_DATA_KEY) return { valid: false };
  try {
    const resp = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`,
      { timeout: 3000 }
    );
    let price = parseFloat(resp.data.price);
    if (price > 0) {
      price = await convertToInr(price, 'USD');
      return { 
        valid: true, 
        price, 
        currency: 'INR', 
        source: 'TwelveData (INR)' 
      };
    }
  } catch (e) {
    console.log(`TwelveData quote failed: ${e.message}`);
  }
  return { valid: false };
}

async function alphaVantageQuote(symbol) {
  if (!AV_KEY) return { valid: false };
  try {
    const resp = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`
    );
    const quote = resp.data['Global Quote'];
    if (quote && quote['05. price']) {
      let price = parseFloat(quote['05. price']);
      price = await convertToInr(price, 'USD');
      return { 
        valid: true, 
        price, 
        currency: 'INR', 
        source: 'AlphaVantage (INR)' 
      };
    }
  } catch (e) {
    console.log(`AlphaVantage quote failed: ${e.message}`);
  }
  return { valid: false };
}

async function finnhubQuote(symbol) {
  if (!FINNHUB_KEY) return { valid: false };
  try {
    const resp = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    if (resp.data.c && resp.data.c > 0) {
      let price = resp.data.c;
      price = await convertToInr(price, 'USD');
      return { 
        valid: true, 
        price, 
        currency: 'INR', 
        source: 'Finnhub (INR)' 
      };
    }
  } catch (e) {
    console.log(`Finnhub quote failed: ${e.message}`);
  }
  return { valid: false };
}

async function yahooHistory(symbol, range) {
  try {
    const resp = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`,
      { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    
    const timestamps = resp.data.chart.result[0].timestamp;
    const closes = resp.data.chart.result[0].indicators.quote[0].close;
    const currency = resp.data.chart.result[0].meta?.currency || 'USD';
    
    console.log(`📈 Raw history ${symbol}: ${closes.slice(0,3)}... currency: ${currency}`);
    
    const historyPromises = timestamps.map(async (ts, i) => {
      let price = closes[i] || 0;
      if (price > 0 && currency !== 'INR') {
        price = await convertToInr(price, currency);
      }
      return {
        date: new Date(ts * 1000).toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2))
      };
    });
    
    const history = await Promise.all(historyPromises);
    const validHistory = history.filter(d => d.price > 0).slice(-50);
    
    console.log(`✅ ${symbol} history: ${validHistory.length} INR points, last: ₹${validHistory.slice(-1)[0]?.price}`);
    return validHistory;
  } catch (e) {
    console.log(`Yahoo history failed ${symbol}: ${e.message}`);
    return [];
  }
}

async function twelveDataHistory(symbol, period) {
  if (!TWELVE_DATA_KEY) return [];
  try {
    const resp = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=daily&outputsize=30&apikey=${TWELVE_DATA_KEY}`
    );
    const history = resp.data.values?.map(async (v) => {
      let price = parseFloat(v.close);
      price = await convertToInr(price, 'USD');
      return {
        date: v.datetime,
        price: parseFloat(price.toFixed(2))
      };
    }) || [];
    return (await Promise.all(history)).filter(d => d.price > 0);
  } catch (e) {
    console.log(`TwelveData history failed: ${e.message}`);
    return [];
  }
}

async function alphaVantageHistory(symbol) {
  if (!AV_KEY) return [];
  try {
    const resp = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`
    );
    const series = resp.data['Time Series (Daily)'];
    const historyPromises = Object.entries(series || {}).map(async ([date, data]) => {
      let price = parseFloat(data['4. close']);
      price = await convertToInr(price, 'USD');
      return { date, price: parseFloat(price.toFixed(2)) };
    });
    const history = await Promise.all(historyPromises);
    return history.filter(d => d.price > 0).slice(0, 30);
  } catch (e) {
    console.log(`AlphaVantage history failed: ${e.message}`);
    return [];
  }
}

// ✅ REAL TOP PERFORMERS - LIVE NSE DATA (Yahoo Finance)
router.get('/top-performers', auth, async (req, res) => {
  try {
    console.log(`🔥 Fetching LIVE NIFTY 50 data for top performers...`);

    // Full NIFTY 50 list
    const NIFTY_50_STOCKS = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS',
      'INFY.NS', 'HINDUNILVR.NS', 'LT.NS', 'SWIFT.NS', 'WIPRO.NS',
      'ITC.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
      'MARUTI.NS', 'NTPC.NS', 'SUNPHARMA.NS', 'TITAN.NS', 'NESTLEIND.NS',
      'POWERGRID.NS', 'ULTRACEMCO.NS', 'TATAMOTORS.NS', 'ONGC.NS', 'TECHM.NS'
    ];

    // Fetch ALL prices in parallel
    const pricePromises = NIFTY_50_STOCKS.map(async (symbol) => {
      try {
        const resp = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d`,
          { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        
        const meta = resp.data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice != null) {
          const price = parseFloat(meta.regularMarketPrice);
          const prevClose = parseFloat(meta.previousClose) || price;
          const change = price - prevClose;
          const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
          
          // Convert to INR if needed
          let finalPrice = price;
          if (meta.currency === 'USD') {
            finalPrice = await convertToInr(price, 'USD');
          }
          
          return {
            symbol: symbol.replace('.NS', ''),
            fullSymbol: symbol,
            companyName: symbol.replace('.NS', '').replace(/^[A-Z]+/, match => match.toUpperCase()),
            currentPrice: finalPrice,
            change: change,
            todayChangePercent: changePercent,
            valid: true
          };
        }
      } catch (e) {
        console.log(`⚠️ ${symbol} failed`);
      }
      return null;
    });

    const results = (await Promise.all(pricePromises)).filter(Boolean);
    
    // Sort by % change (gainers first)
    const sorted = results.sort((a, b) => b.todayChangePercent - a.todayChangePercent);
    
    // Split: Top 5 Gainers + Top 5 Losers
    const topGainers = sorted.filter(s => s.todayChangePercent >= 0).slice(0, 5);
    const topLosers = sorted.filter(s => s.todayChangePercent < 0)
                           .sort((a, b) => a.todayChangePercent - b.todayChangePercent)
                           .slice(0, 5);

    console.log(`✅ LIVE: ${topGainers.length} gainers, ${topLosers.length} losers`);

    res.json({
      success: true,
      topPerformers: topGainers,
      bottomPerformers: topLosers,
      totalScanned: results.length,
      lastUpdated: new Date().toISOString(),
      usdInrRate: cachedUsdInrRate.toFixed(2)
    });

  } catch (error) {
    console.error('❌ Top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Market data temporarily unavailable',
      topPerformers: [],
      bottomPerformers: [],
      fallback: true
    });
  }
});

module.exports = router;
