import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/market-data/';

// Get stock quote
const getQuote = async (symbol, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + `quote/${symbol}`, config);
  return response.data.quote;
};

// Search stocks
const searchStocks = async (query, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + `search/${query}`, config);
  return response.data.results;
};

const marketService = {
  getQuote,
  searchStocks,
};

export default marketService;
