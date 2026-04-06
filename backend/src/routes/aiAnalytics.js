const express = require("express");
const axios = require("axios");

const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

/* =========================================================
   HELPERS
========================================================= */

// Normalize symbol for Yahoo
function normalizeSymbol(symbol) {
  if (symbol.includes(".NS") || symbol.includes(".BO")) {
    return symbol;
  }
  return `${symbol}.NS`;
}

// Calculate Simple Moving Average
function calculateSMA(prices, period) {
  if (prices.length < period) return null;

  const sliced = prices.slice(-period);
  const sum = sliced.reduce((a, b) => a + b, 0);
  return sum / period;
}

// Calculate RSI (basic implementation)
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

// Volatility (standard deviation)
function calculateVolatility(prices) {
  const mean =
    prices.reduce((sum, p) => sum + p, 0) / prices.length;

  const variance =
    prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
    prices.length;

  return Math.sqrt(variance);
}

// Sentiment Score from Finnhub news
async function getSentiment(symbol) {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/company-news`,
      {
        params: {
          symbol: symbol.replace(".NS", ""),
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          to: new Date().toISOString().split("T")[0],
          token: FINNHUB_API_KEY,
        },
      }
    );

    const articles = response.data || [];

    if (articles.length === 0) {
      return { score: 0, label: "Neutral" };
    }

    let positive = 0;
    let negative = 0;

    articles.forEach((article) => {
      const headline = article.headline.toLowerCase();

      if (
        headline.includes("surge") ||
        headline.includes("gain") ||
        headline.includes("growth") ||
        headline.includes("profit")
      ) {
        positive++;
      }

      if (
        headline.includes("fall") ||
        headline.includes("loss") ||
        headline.includes("decline") ||
        headline.includes("drop")
      ) {
        negative++;
      }
    });

    const score =
      (positive - negative) / articles.length;

    let label = "Neutral";
    if (score > 0.2) label = "Bullish";
    if (score < -0.2) label = "Bearish";

    return { score: parseFloat(score.toFixed(2)), label };
  } catch (err) {
    console.log("Sentiment fetch failed:", err.message);
    return { score: 0, label: "Neutral" };
  }
}

/* =========================================================
   MAIN AI ANALYSIS ENDPOINT
========================================================= */

router.get("/stock-analysis/:symbol", async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);

    // Fetch historical prices from Yahoo Chart API
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const result =
      response.data?.chart?.result?.[0];

    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "No data found" });
    }

    const prices =
      result.indicators.quote[0].close.filter(Boolean);

    const currentPrice = prices[prices.length - 1];

    // Technical Indicators
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const rsi = calculateRSI(prices);
    const volatility = calculateVolatility(prices);

    // Trend Score
    let trendScore = 0;

    if (sma20 && sma50) {
      if (sma20 > sma50) trendScore += 0.4;
      else trendScore -= 0.4;
    }

    if (rsi) {
      if (rsi < 30) trendScore += 0.3;
      if (rsi > 70) trendScore -= 0.3;
    }

    // Normalize
    trendScore = Math.max(-1, Math.min(1, trendScore));

    // Prediction (simple volatility adjusted)
    const predictedNextDay =
      currentPrice * (1 + trendScore * 0.01);

    const predictedNextWeek =
      currentPrice * (1 + trendScore * 0.03);

    const confidence =
      1 - Math.min(volatility / currentPrice, 0.5);

    // Sentiment
    const sentiment = await getSentiment(symbol);

    // Final Signal
    let overallSignal = "HOLD";

    const combinedScore =
      trendScore * 0.6 + sentiment.score * 0.4;

    if (combinedScore > 0.3) overallSignal = "BUY";
    if (combinedScore < -0.3) overallSignal = "SELL";

    return res.json({
      success: true,
      data: {
        currentPrice,
        sentiment,
        technical: {
          sma20,
          sma50,
          rsi,
          volatility: parseFloat(volatility.toFixed(2)),
          trendScore: parseFloat(trendScore.toFixed(2)),
        },
        prediction: {
          nextDay: parseFloat(predictedNextDay.toFixed(2)),
          nextWeek: parseFloat(predictedNextWeek.toFixed(2)),
          confidence: parseFloat(confidence.toFixed(2)),
        },
        overallSignal,
      },
    });
  } catch (err) {
    console.error("AI analysis error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "AI analysis failed" });
  }
});

module.exports = router;
