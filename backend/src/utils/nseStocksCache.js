const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CACHE_FILE = path.join(__dirname, '../data/nse_stocks.json');
const NSE_CSV_URL = 'https://archives.nseindia.com/content/equities/EQUITY_L.csv';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Parse CSV to JSON
const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const stocks = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const columns = lines[i].split(',');
    if (columns.length < 2) continue;
    
    const symbol = columns[0]?.trim();
    const name = columns[1]?.trim();
    
    if (symbol && name) {
      stocks.push({
        symbol,
        name,
        exchange: 'NSE',
        region: 'India',
        currency: 'INR'
      });
    }
  }
  
  return stocks;
};

// Fetch and cache NSE stocks
const fetchAndCacheNSEStocks = async () => {
  try {
    console.log('🔄 Fetching NSE stock list...');
    const response = await axios.get(NSE_CSV_URL, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const stocks = parseCSV(response.data);
    
    if (stocks.length > 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(stocks, null, 2));
      console.log(`✅ Successfully cached ${stocks.length} NSE stocks`);
      return stocks;
    } else {
      console.log('⚠️ No stocks parsed from CSV');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to fetch NSE stocks:', error.message);
    return null;
  }
};

// Load cached stocks from file
const getCachedStocks = () => {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const stocks = JSON.parse(data);
      console.log(`📂 Loaded ${stocks.length} stocks from cache`);
      return stocks;
    }
  } catch (error) {
    console.error('❌ Error reading cached stocks:', error.message);
  }
  return [];
};

// Initialize cache on startup
const initializeCache = async () => {
  if (!fs.existsSync(CACHE_FILE)) {
    console.log('📥 First time setup: Fetching NSE stocks...');
    await fetchAndCacheNSEStocks();
  } else {
    const stats = fs.statSync(CACHE_FILE);
    const ageInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    
    console.log(`✅ NSE stocks cache loaded (${ageInHours.toFixed(1)} hours old)`);
    
    // Auto-refresh if older than 24 hours
    if (ageInHours > 24) {
      console.log('🔄 Cache is old, refreshing...');
      await fetchAndCacheNSEStocks();
    }
  }
};

module.exports = {
  getCachedStocks,
  fetchAndCacheNSEStocks,
  initializeCache
};
