const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

const router = express.Router();

const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const TWELVE_KEY = process.env.TWELVE_DATA_API_KEY;

/* =========================================================
   PRICE CACHE
========================================================= */

const priceCache = new Map();
const PRICE_CACHE_DURATION = 60 * 1000; // 1 minute

/* =========================================================
   USD → INR RATE
========================================================= */

let cachedUsdInrRate = 83;
let lastRateFetch = 0;
const RATE_CACHE_DURATION = 60 * 60 * 1000;

async function getUsdToInrRate() {
  if (Date.now() - lastRateFetch < RATE_CACHE_DURATION) {
    return cachedUsdInrRate;
  }

  try {
    const response = await axios.get(
      "https://api.exchangerate.host/latest?base=USD&symbols=INR",
      { timeout: 5000 }
    );

    const rate = response.data?.rates?.INR;

    if (rate && rate > 60 && rate < 100) {
      cachedUsdInrRate = rate;
      lastRateFetch = Date.now();
      console.log("💱 USD/INR:", rate);
      return rate;
    }
  } catch (err) {
    console.log("⚠ Using cached USD/INR:", cachedUsdInrRate);
  }

  return cachedUsdInrRate;
}

/* =========================================================
   SYMBOL NORMALIZATION
========================================================= */

function normalizeSymbol(symbol) {
  if (symbol.includes(".NS") || symbol.includes(".BO"))
    return symbol;
  return `${symbol}.NS`;
}

/* =========================================================
   FETCH STOCK PRICE (Multi Source)
========================================================= */

async function fetchStockPrice(symbol) {
  const normalized = normalizeSymbol(symbol);

  // Cache
  if (priceCache.has(normalized)) {
    const cached = priceCache.get(normalized);
    if (Date.now() - cached.timestamp < PRICE_CACHE_DURATION) {
      return cached.data;
    }
  }

  /* ==========================
     1️⃣ YAHOO CHART API
  ========================== */

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${normalized}?interval=1m&range=1d`;

    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const result = response.data?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close;

    if (closes && closes.length > 0) {
      const latest = closes[closes.length - 1];

      if (latest && latest > 0) {
        const stockData = {
          symbol: normalized,
          price: latest,
          currency: 'INR',
          valid: true,
          source: 'yahoo_chart'
        };

        priceCache.set(normalized, {
          data: stockData,
          timestamp: Date.now()
        });

        console.log(`✅ Yahoo LIVE: ${normalized} ₹${latest}`);
        return stockData;
      }
    }

  } catch (err) {
    console.log("⚠ Yahoo failed:", normalized);
  }

  /* ==========================
     2️⃣ FINNHUB
  ========================== */

  if (FINNHUB_KEY) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${normalized}&token=${FINNHUB_KEY}`,
        { timeout: 5000 }
      );

      const price = response.data?.c;

      if (price && price > 0) {
        const stockData = {
          symbol: normalized,
          price,
          currency: 'INR',
          valid: true,
          source: 'finnhub'
        };

        priceCache.set(normalized, {
          data: stockData,
          timestamp: Date.now()
        });

        console.log(`✅ Finnhub: ${normalized} ₹${price}`);
        return stockData;
      }

    } catch (err) {
      console.log("⚠ Finnhub failed:", normalized);
    }
  }

  /* ==========================
     3️⃣ ALPHA VANTAGE
  ========================== */

  if (ALPHA_KEY) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${normalized}&apikey=${ALPHA_KEY}`,
        { timeout: 5000 }
      );

      const price = parseFloat(
        response.data?.["Global Quote"]?.["05. price"]
      );

      if (price && price > 0) {
        const stockData = {
          symbol: normalized,
          price,
          currency: 'INR',
          valid: true,
          source: 'alpha'
        };

        priceCache.set(normalized, {
          data: stockData,
          timestamp: Date.now()
        });

        console.log(`✅ Alpha: ${normalized} ₹${price}`);
        return stockData;
      }

    } catch (err) {
      console.log("⚠ Alpha failed:", normalized);
    }
  }

  /* ==========================
     4️⃣ TWELVE DATA
  ========================== */

  if (TWELVE_KEY) {
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/quote?symbol=${normalized}&apikey=${TWELVE_KEY}`,
        { timeout: 5000 }
      );

      const price = parseFloat(response.data?.price);

      if (price && price > 0) {
        const stockData = {
          symbol: normalized,
          price,
          currency: 'INR',
          valid: true,
          source: 'twelve'
        };

        priceCache.set(normalized, {
          data: stockData,
          timestamp: Date.now()
        });

        console.log(`✅ TwelveData: ${normalized} ₹${price}`);
        return stockData;
      }

    } catch (err) {
      console.log("⚠ TwelveData failed:", normalized);
    }
  }

  console.warn("❌ All APIs failed:", normalized);
  return { symbol: normalized, valid: false };
}

/* =========================================================
   UPDATE PORTFOLIO
========================================================= */

async function updatePortfolioWithRealTimePrices(portfolio) {

  for (const holding of portfolio.holdings) {

    const stockData = await fetchStockPrice(holding.symbol);

    if (stockData.valid) {

      holding.currentPrice = stockData.price;
      holding.totalValue = holding.quantity * stockData.price;

      const costBasis = holding.quantity * holding.averagePrice;

      holding.profitLoss = holding.totalValue - costBasis;

      holding.profitLossPercentage =
        costBasis > 0
          ? (holding.profitLoss / costBasis) * 100
          : 0;

      holding.lastUpdated = new Date();

      console.log(
        `📈 ${holding.symbol}: ₹${stockData.price.toFixed(2)} | P&L ₹${holding.profitLoss.toFixed(2)}`
      );
    }
  }

  const totalHoldingsValue = portfolio.holdings.reduce(
    (sum, h) => sum + (h.totalValue || 0),
    0
  );

  portfolio.currentValue = portfolio.availableCash + totalHoldingsValue;
  portfolio.totalInvested = portfolio.initialAmount - portfolio.availableCash;

  portfolio.totalProfitLoss =
    portfolio.currentValue - portfolio.initialAmount;

  portfolio.totalProfitLossPercentage =
    portfolio.initialAmount > 0
      ? (portfolio.totalProfitLoss / portfolio.initialAmount) * 100
      : 0;

  await portfolio.save();
  return portfolio;
}

/* =========================================================
   ROUTES
========================================================= */

router.post("/", auth, async (req, res) => {
  try {
    const { name, initialAmount, description } = req.body;

    const portfolio = await Portfolio.create({
      userId: req.user.id,
      name: name.trim(),
      initialAmount,
      availableCash: initialAmount,
      currentValue: initialAmount,
      description: description?.trim() || "",
      holdings: []
    });

    res.status(201).json({ success: true, portfolio });

  } catch {
    res.status(500).json({ success: false });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({ success: true, portfolios });

  } catch {
    res.status(500).json({ success: false });
  }
});

router.get("/refresh-all", auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      userId: req.user.id
    });

    for (const portfolio of portfolios) {
      if (portfolio.holdings.length > 0) {
        await updatePortfolioWithRealTimePrices(portfolio);
      }
    }

    res.json({ success: true });

  } catch {
    res.status(500).json({ success: false });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio)
      return res.status(404).json({ success: false });

    res.json({ success: true, portfolio });

  } catch {
    res.status(500).json({ success: false });
  }
});

// Get portfolio holdings (needed by Analytics page)
router.get("/:id/holdings", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found"
      });
    }

    return res.json({
      success: true,
      holdings: portfolio.holdings || []
    });

  } catch (error) {
    console.error("❌ Error fetching holdings:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


router.get("/:id/details", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio)
      return res.status(404).json({ success: false });

    await updatePortfolioWithRealTimePrices(portfolio);

    res.json({ success: true, portfolio });

  } catch {
    res.status(500).json({ success: false });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ success: true });

  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
