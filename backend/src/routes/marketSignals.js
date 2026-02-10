const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const technicalindicators = require('technicalindicators'); // npm install technicalindicators

const router = express.Router();
const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper: Calculate RSI from price data array
function calculateRSI(closingPrices) {
  try {
    const inputRSI = {
      values: closingPrices,
      period: 14
    };
    return technicalindicators.RSI.calculate(inputRSI);
  } catch (e) {
    console.error('RSI calculation error', e);
    return [];
  }
}

// Route: Get buy/sell signal for a stock symbol
router.get('/signal/:symbol', auth, async (req, res) => {
  const { symbol } = req.params;
  try {
    // Fetch daily stock prices from Alpha Vantage (last 100 days)
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`;
    const { data } = await axios.get(url);

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) return res.status(404).json({ success: false, message: 'Symbol data unavailable' });

    // Extract closing prices descending oldest -> newest
    const sortedDates = Object.keys(timeSeries).sort();
    const closePrices = sortedDates.map(date => parseFloat(timeSeries[date]['4. close']));

    // Calculate RSI
    const rsiValues = calculateRSI(closePrices);

    // Use latest RSI (last value)
    const latestRSI = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;

    // Simple buy/sell/hold signal based on RSI
    let signal = 'HOLD';
    if (latestRSI !== null) {
      if (latestRSI >= 70) signal = 'SELL';
      else if (latestRSI <= 30) signal = 'BUY';
    }

    res.json({
      success: true,
      symbol,
      latestRSI,
      signal,
      explanation: 'RSI (Relative Strength Index) based simple indicator'
    });

  } catch (error) {
    console.error('Error fetching stock signal:', error);
    res.status(500).json({ success: false, message: 'Error fetching stock signal' });
  }
});

module.exports = router;
