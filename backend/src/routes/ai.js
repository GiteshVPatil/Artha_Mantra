const express = require('express');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/ai/sentiment/:symbol
// @desc    Get sentiment analysis for a stock
// @access  Private
router.get('/sentiment/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;

    // Mock sentiment data
    const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    const mockSentiment = {
      symbol: symbol.toUpperCase(),
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      confidence: Math.random(),
      score: Math.random() * 2 - 1, // -1 to 1
      sources: Math.floor(Math.random() * 100) + 10,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      sentiment: mockSentiment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ai/prediction/:symbol
// @desc    Get price prediction for a stock
// @access  Private
router.get('/prediction/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const currentPrice = Math.random() * 300 + 50;

    // Mock prediction data
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
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ai/news
// @desc    Get latest market news
// @access  Private
router.get('/news', auth, async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      return res.status(500).json({ success: false, message: 'News API key not configured' });
    }

    // Call NewsAPI to get top business news
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
