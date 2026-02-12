const express = require('express');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const Trading = require('../models/Trading');
const { analyzeTrade } = require('../services/aiService');
const { generateMonthlyReport } = require('../services/aiService');


const router = express.Router();

/* ======================================================
   📊 AI MONTHLY TRADER PERSONALITY REPORT (NEW FEATURE)
====================================================== */
router.get('/monthly-report', auth, async (req, res) => {
  try {
    const { portfolioId } = req.query;

    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio ID is required'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trades = await Trading.find({
      userId: req.user.id,
      portfolioId,
      type: 'SELL',
      status: 'EXECUTED',
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (trades.length === 0) {
      return res.json({
        success: true,
        report: "Not enough trades in the last 30 days to generate personality analysis.",
        metrics: null
      });
    }

    // ==========================
    // 📊 Calculate Metrics
    // ==========================

    const totalTrades = trades.length;

    const wins = trades.filter(t => (t.realizedProfit || 0) > 0);
    const losses = trades.filter(t => (t.realizedProfit || 0) < 0);

    const winRate = (wins.length / totalTrades) * 100;

    const avgProfit =
      trades.reduce((sum, t) => sum + (t.realizedProfit || 0), 0) /
      totalTrades;

    const biggestWin = Math.max(...trades.map(t => t.realizedProfit || 0));
    const biggestLoss = Math.min(...trades.map(t => t.realizedProfit || 0));

    const avgLoss =
      losses.length > 0
        ? losses.reduce((sum, t) => sum + t.realizedProfit, 0) / losses.length
        : 0;

    // ==========================
    // 🧠 AI PROMPT
    // ==========================

    const personalityPrompt = `
You are a professional trading psychologist.

Analyze this trader's performance from the last 30 days:

Total Trades: ${totalTrades}
Win Rate: ${winRate.toFixed(2)}%
Average Profit per Trade: ${avgProfit.toFixed(2)}
Biggest Win: ${biggestWin.toFixed(2)}
Biggest Loss: ${biggestLoss.toFixed(2)}
Average Loss: ${avgLoss.toFixed(2)}

Provide beginner-friendly structured output:

1. Trader Personality Type (1 line)
2. Strengths (bullet points)
3. Weaknesses (bullet points)
4. Risk Profile (Low/Medium/High + short explanation)
5. One Clear Improvement Strategy

Keep it concise and clear.
`;

    const aiResult = await generateMonthlyReport({
      totalTrades: totalTrades,
      winRate: winRate,
      biggestWin: biggestWin,
      biggestLoss: biggestLoss,
      avgProfit: avgProfit
    });



    return res.json({
      success: true,
      report: aiResult.report,
      metrics: {
        totalTrades,
        winRate,
        biggestWin,
        biggestLoss,
        avgProfit
      }
    });

  } catch (error) {
    console.error("AI Monthly Report Error:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report'
    });
  }
});


/* ======================================================
   🔥 EXISTING ROUTES (UNCHANGED)
====================================================== */

// Sentiment
router.get('/sentiment/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;

    const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    const mockSentiment = {
      symbol: symbol.toUpperCase(),
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      confidence: Math.random(),
      score: Math.random() * 2 - 1,
      sources: Math.floor(Math.random() * 100) + 10,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      sentiment: mockSentiment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Prediction
router.get('/prediction/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const currentPrice = Math.random() * 300 + 50;

    const mockPrediction = {
      symbol: symbol.toUpperCase(),
      currentPrice,
      predictedPrice: currentPrice * (1 + (Math.random() * 0.2 - 0.1)),
      confidence: Math.random() * 0.5 + 0.5,
      timeframe: '1_week',
      model: 'LSTM-CNN',
      recommendation: ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'][Math.floor(Math.random() * 5)],
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      prediction: mockPrediction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// News
router.get('/news', auth, async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    if (!NEWS_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'News API key not configured'
      });
    }

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'business',
        language: 'en',
        apiKey: NEWS_API_KEY,
        pageSize: 10,
      },
    });

    res.json({
      success: true,
      news: response.data.articles,
    });

  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

module.exports = router;
