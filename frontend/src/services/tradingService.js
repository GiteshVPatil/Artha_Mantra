import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/trading/';

// Execute trade
const executeTrade = async (tradeData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'execute', tradeData, config);
  return response.data.trade;
};

// Get trading history
const getTradingHistory = async (params = {}, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };

  const response = await axios.get(API_URL + 'history', config);
  return response.data;
};

const tradingService = {
  executeTrade,
  getTradingHistory,
};

export default tradingService;
