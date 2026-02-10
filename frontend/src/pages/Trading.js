import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Trading = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userHoldings, setUserHoldings] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [signal, setSignal] = useState(null);
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    orderType: 'MARKET',
    action: 'BUY',
    quantity: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');

  const { user, token } = useAuth();

  // API Configuration
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  // Format currency in INR
  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Fetch user portfolios on component mount
  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Fetch holdings when portfolio changes
  useEffect(() => {
    if (selectedPortfolio && orderForm.action === 'SELL') {
      fetchUserHoldings();
    }
  }, [selectedPortfolio, orderForm.action]);

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const portfolioList = response.data.portfolios || [];
      setPortfolios(portfolioList);

      if (portfolioList.length > 0) {
        setSelectedPortfolio(portfolioList[0]._id);
        setMessage('');
      } else {
        setMessage('No portfolios found. Please create a portfolio first from the Portfolio page.');
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setMessage('Error loading portfolios. Please create a portfolio first.');
    }
  };

  // Fetch user holdings for sell orders
  const fetchUserHoldings = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const response = await axios.get(`${API_BASE}/trading/holdings/${selectedPortfolio}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUserHoldings(response.data.holdings);
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setUserHoldings([]);
    }
  };

  // Search for stocks using the correct endpoint
  const handleStockSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/trading/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSearchResults(response.data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
      if (error.response?.status !== 404) {
        setMessage('Error searching for stocks');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ FIXED: Get stock price with validation
  const fetchStockQuote = async (symbol) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/trading/price/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // ✅ VALIDATION: Ensure price is reasonable
        const price = parseFloat(response.data.price);
        
        if (!price || price <= 0) {
          throw new Error('Invalid price received from API');
        }

        // ✅ Log for debugging
        console.log(`📊 Stock Price Received:`, {
          symbol: response.data.symbol,
          price: price,
          currency: response.data.currency || 'INR',
          source: response.data.source
        });

        const quote = {
          symbol: response.data.symbol,
          currentPrice: price,
          companyName: selectedStock?.name || `${symbol} Corp`,
          change: response.data.change || 0,
          changePercent: response.data.changePercent ? `${response.data.changePercent.toFixed(2)}%` : '0.00%',
          volume: 'N/A',
          marketCap: 'N/A',
          currency: response.data.currency || 'INR'
        };
        setStockQuote(quote);
        
        // ✅ Set price in form (already in INR)
        setOrderForm(prev => ({ 
          ...prev, 
          symbol, 
          price: price.toFixed(2) // ✅ IMPORTANT: Convert to string with 2 decimals
        }));
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setMessage('Error fetching stock price');
      setStockQuote(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    fetchStockQuote(stock.symbol);
    setSearchQuery(stock.symbol);
    setSearchResults([]);
  };

  // Handle holding selection for sell orders
  const handleHoldingSelect = (holding) => {
    setSelectedStock({
      symbol: holding.symbol,
      name: holding.companyName
    });
    setOrderForm(prev => ({
      ...prev,
      symbol: holding.symbol,
      price: holding.currentPrice.toFixed(2), // ✅ String with 2 decimals
      action: 'SELL'
    }));
    setSearchQuery(holding.symbol);
    
    // Set stock quote from holding data
    setStockQuote({
      symbol: holding.symbol,
      currentPrice: holding.currentPrice,
      companyName: holding.companyName,
      change: 0,
      changePercent: '0.00%',
      volume: 'N/A',
      marketCap: 'N/A',
      currency: 'INR'
    });
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    // ✅ VALIDATION: Prevent negative values
    if ((field === 'quantity' || field === 'price') && value < 0) {
      return;
    }
    
    setOrderForm(prev => ({ ...prev, [field]: value }));
    
    // When action changes to SELL, fetch holdings
    if (field === 'action' && value === 'SELL') {
      fetchUserHoldings();
    }
  };

  // ✅ FIXED: Place order with validation
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!selectedPortfolio) {
      setMessage('Please select a portfolio first or create one from the Portfolio page.');
      return;
    }

    if (!orderForm.symbol || !orderForm.quantity || !orderForm.price) {
      setMessage('Please fill in all required fields');
      return;
    }

    // ✅ VALIDATION: Quantity and price must be positive
    const quantity = parseInt(orderForm.quantity);
    const price = parseFloat(orderForm.price);

    if (quantity <= 0 || isNaN(quantity)) {
      setMessage('Quantity must be a positive number');
      return;
    }

    if (price <= 0 || isNaN(price)) {
      setMessage('Price must be a positive number');
      return;
    }

    // ✅ LOG: Debug info before sending
    console.log('🔄 Placing Order:', {
      symbol: orderForm.symbol,
      quantity: quantity,
      price: price,
      action: orderForm.action,
      total: quantity * price
    });

    setLoading(true);
    try {
      const orderData = {
        portfolioId: selectedPortfolio,
        symbol: orderForm.symbol,
        companyName: selectedStock?.name || `${orderForm.symbol} Corp`,
        type: orderForm.action,
        orderType: orderForm.orderType,
        quantity: quantity,
        price: price  // ✅ Sending as number, in INR
      };

      // ✅ LOG: What we're sending
      console.log('📤 Order Data Being Sent:', orderData);

      const response = await axios.post(`${API_BASE}/trading/execute`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage(`✅ Order placed successfully! ${orderForm.action} ${orderForm.quantity} shares of ${orderForm.symbol}`);
        setOrderForm({
          symbol: '',
          orderType: 'MARKET',
          action: 'BUY',
          quantity: '',
          price: ''
        });
        setSelectedStock(null);
        setStockQuote(null);
        setSearchQuery('');
        setSignal(null);

        fetchPortfolios();
        if (orderForm.action === 'SELL') {
          fetchUserHoldings();
        }
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      setMessage(`❌ ${error.response?.data?.message || 'Error placing order'}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear message after 8 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Enhanced Quick Access with Indian stocks
  const quickAccessStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon Inc.' },
    { symbol: 'INFY', name: 'Infosys Ltd.' },
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' }
  ];

  // Styles (unchanged)
  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#202124',
    margin: 0
  };

  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#e8f5e8',
    color: '#137333',
    fontSize: '14px',
    fontWeight: '500'
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#137333'
  };

  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    height: 'fit-content'
  };

  const cardTitleStyle = {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const searchResultStyle = {
    padding: '10px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    transition: 'background-color 0.2s'
  };

  const holdingStyle = {
    padding: '10px',
    border: '1px solid #34a853',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    backgroundColor: '#e8f5e8',
    transition: 'background-color 0.2s'
  };

  const messageStyle = {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: message.includes('✅') ? '#e8f5e8' : '#fef2f2',
    color: message.includes('✅') ? '#137333' : '#d93025',
    border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Trading Platform</h1>
        <div style={statusStyle}>
          <span style={dotStyle}></span>
          Market Open
        </div>
      </div>

      {message && (
        <div style={messageStyle}>
          {message}
          {message.includes('No portfolios') && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link 
                to="/portfolio"
                style={{
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '12px'
                }}
              >
                Go to Portfolio Page
              </Link>
              <button 
                onClick={fetchPortfolios}
                style={{
                  backgroundColor: '#34a853',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Refresh Portfolios
              </button>
            </div>
          )}
        </div>
      )}

      <div style={layoutStyle}>
        <div>
          {/* Stock Search */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Stock Search</h3>
            <input 
              type="text" 
              placeholder="Search stocks (e.g., AAPL, TCS, RELIANCE)" 
              style={inputStyle}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleStockSearch(e.target.value);
              }}
            />
            
            {searchLoading && (
              <div style={{ padding: '10px', textAlign: 'center', color: '#5f6368' }}>
                Searching...
              </div>
            )}
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#5f6368' }}>
                  Search Results:
                </div>
                {searchResults.map((stock, index) => (
                  <div 
                    key={index}
                    style={searchResultStyle}
                    onClick={() => handleStockSelect(stock)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e8f0fe'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  >
                    <strong>{stock.symbol}</strong> - {stock.name}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {stock.region || 'N/A'} | {stock.currency || 'INR'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show user holdings for SELL orders */}
            {orderForm.action === 'SELL' && userHoldings.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#137333' }}>
                  Your Holdings (Available to Sell):
                </div>
                {userHoldings.map((holding, index) => (
                  <div 
                    key={index}
                    style={holdingStyle}
                    onClick={() => handleHoldingSelect(holding)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#d4edda'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e8f5e8'}
                  >
                    <strong>{holding.symbol}</strong> - {holding.companyName}
                    <div style={{ fontSize: '12px', color: '#137333' }}>
                      {holding.quantity} shares @ {formatCurrency(holding.averagePrice)} 
                      (Current: {formatCurrency(holding.currentPrice)})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Stock Quote */}
            {stockQuote && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #dadce0' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#202124' }}>
                  {stockQuote.symbol} - {stockQuote.companyName}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div>
                    <strong>Price:</strong> {formatCurrency(stockQuote.currentPrice)} ({stockQuote.currency})
                  </div>
                  <div>
                    <strong>Change:</strong> 
                    <span style={{ 
                      color: (stockQuote.change || 0) >= 0 ? '#137333' : '#d93025',
                      fontWeight: '500',
                      marginLeft: '5px'
                    }}>
                      {formatCurrency(stockQuote.change)} ({stockQuote.changePercent})
                    </span>
                  </div>
                  <div>
                    <strong>Volume:</strong> {stockQuote.volume}
                  </div>
                  <div>
                    <strong>Market Cap:</strong> {stockQuote.marketCap}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Access */}
          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h3 style={cardTitleStyle}>Quick Access</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {quickAccessStocks.map(stock => (
                <button 
                  key={stock.symbol}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    backgroundColor: selectedStock?.symbol === stock.symbol ? '#e8f0fe' : 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setSearchQuery(stock.symbol);
                    handleStockSelect(stock);
                  }}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Place Order */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Place Order</h3>

            {/* Portfolio Selection */}
            {portfolios.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Portfolio
                </label>
                <select 
                  style={inputStyle}
                  value={selectedPortfolio}
                  onChange={(e) => setSelectedPortfolio(e.target.value)}
                >
                  {portfolios.map(portfolio => (
                    <option key={portfolio._id} value={portfolio._id}>
                      {portfolio.name} ({formatCurrency(portfolio.availableCash || 0)} available)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handlePlaceOrder}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Stock Symbol
                </label>
                <input 
                  type="text" 
                  placeholder="Enter symbol (e.g., AAPL, TCS, RELIANCE)" 
                  style={inputStyle}
                  value={orderForm.symbol}
                  onChange={(e) => handleFormChange('symbol', e.target.value.toUpperCase())}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Order Type
                  </label>
                  <select 
                    style={inputStyle}
                    value={orderForm.orderType}
                    onChange={(e) => handleFormChange('orderType', e.target.value)}
                  >
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Action
                  </label>
                  <select 
                    style={inputStyle}
                    value={orderForm.action}
                    onChange={(e) => handleFormChange('action', e.target.value)}
                  >
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Quantity
                  </label>
                  <input 
                    type="number" 
                    placeholder="Number of shares" 
                    style={inputStyle}
                    value={orderForm.quantity}
                    onChange={(e) => handleFormChange('quantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Price per Share (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Price per share" 
                    style={inputStyle}
                    value={orderForm.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Order Summary */}
              {orderForm.quantity && orderForm.price && (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #dadce0'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Order Summary:
                  </div>
                  <div style={{ fontSize: '13px', color: '#5f6368' }}>
                    {orderForm.action} {orderForm.quantity} shares of {orderForm.symbol} 
                    at {formatCurrency(parseFloat(orderForm.price || 0))} per share
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '5px' }}>
                    Total: {formatCurrency(orderForm.quantity * parseFloat(orderForm.price || 0))}
                  </div>
                </div>
              )}

              <button 
                type="submit"
                style={{
                  ...buttonStyle,
                  backgroundColor: loading ? '#ccc' : '#1a73e8',
                  cursor: loading || portfolios.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={loading || portfolios.length === 0}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
