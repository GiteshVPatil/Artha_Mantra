import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/portfolio/';

// Get portfolios
const getPortfolios = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.portfolios;
};

// Create portfolio
const createPortfolio = async (portfolioData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, portfolioData, config);
  return response.data.portfolio;
};

const portfolioService = {
  getPortfolios,
  createPortfolio,
};

export default portfolioService;
