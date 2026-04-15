const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY; // Get from newsapi.org
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd3i1369r01qr304fu0d0d3i1369r01qr304fu0dg';

/* ---------- GET TRADING NEWS ---------- */
router.get('/trading-news', auth, async (req, res) => {
  try {
    const { category = 'business', page = 1, limit = 20 } = req.query;
    
    // Using NewsAPI for general financial news
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'business',
        language: 'en',
        page: page,
        pageSize: limit,
        apiKey: NEWS_API_KEY
      }
    });

    const articles = response.data.articles.map(article => ({
      id: article.url.split('/').pop(),
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.urlToImage,
      source: article.source.name,
      author: article.author,
      publishedAt: article.publishedAt,
      url: article.url
    }));

    res.json({
      success: true,
      articles,
      totalResults: response.data.totalResults,
      page: parseInt(page),
      hasMore: articles.length === limit
    });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});
router.get('/us', async (req, res) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Nasdaq OR Dow Jones OR S&P 500 OR US stock market',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: API_KEY
      }
    });

    const articles = response.data.articles.map((a, i) => ({
      id: i,
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.urlToImage,
      source: a.source.name,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, articles });

  } catch (error) {
    console.error('US news error:', error.message);
    res.json({ success: false, articles: [] });
  }
});

router.get('/india', async (req, res) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'NSE OR BSE OR Sensex OR Nifty OR Indian stock market',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: API_KEY
      }
    });

    const articles = response.data.articles.map((a, i) => ({
      id: i,
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.urlToImage,
      source: a.source.name,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, articles });

  } catch (error) {
    console.error('India news error:', error.message);
    res.json({ success: false, articles: [] });
  }
});

router.get('/crypto', async (req, res) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'crypto OR bitcoin OR ethereum OR blockchain',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: API_KEY
      }
    });

    const articles = response.data.articles.map((a, i) => ({
      id: i,
      title: a.title,
      description: a.description,
      url: a.url,
      imageUrl: a.urlToImage,
      source: a.source.name,
      publishedAt: a.publishedAt
    }));

    res.json({ success: true, articles });

  } catch (error) {
    console.error('Crypto news error:', error.message);
    res.json({ success: false, articles: [] });
  }
});

/* ---------- GET STOCK-SPECIFIC NEWS ---------- */
router.get('/stock-news/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;
    
    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    // Using Finnhub for company-specific news
    const response = await axios.get('https://finnhub.io/api/v1/company-news', {
      params: {
        symbol: symbol,
        from: fromDate,
        to: toDate,
        token: FINNHUB_API_KEY
      }
    });

    const news = response.data.map(article => ({
      id: article.id,
      title: article.headline,
      description: article.summary,
      imageUrl: article.image,
      source: article.source,
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      url: article.url,
      category: article.category,
      related: article.related
    }));

    res.json({
      success: true,
      news,
      symbol: symbol.toUpperCase()
    });
  } catch (error) {
    console.error('Stock news fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock news'
    });
  }
});

/* ---------- SEARCH NEWS ---------- */
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: `${q} AND (trading OR stocks OR finance OR market)`,
        language: 'en',
        page: page,
        pageSize: limit,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY
      }
    });

    const articles = response.data.articles.map(article => ({
      id: article.url.split('/').pop(),
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.urlToImage,
      source: article.source.name,
      author: article.author,
      publishedAt: article.publishedAt,
      url: article.url
    }));

    res.json({
      success: true,
      articles,
      query: q,
      totalResults: response.data.totalResults,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('News search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news'
    });
  }
});

module.exports = router;
