import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Market = () => {
  const [selectedStock, setSelectedStock] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [stockData, setStockData] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(['AAPL', 'TSLA']);
  const [search, setSearch] = useState('');   // 👈 FIXED: Default search
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [chartCurrency, setChartCurrency] = useState('INR');

  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  // Format currency in INR
  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // // 👈 FIXED: Load default stock on mount
  // useEffect(() => {
  //   if (selectedStock) {
  //     fetchStockInfo(selectedStock);
  //     fetchStockHistory(selectedStock, timeframe);
  //   }
  // }, []); // Run once on load

  // Autocomplete/symbol search with debouncing
  useEffect(() => {
    if (search.length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const resp = await axios.get(`${API_BASE}/market-data/search/${search}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(resp.data.results || []);
        if (resp.data.results?.length === 0) {
          setError('No stocks found. Try RELIANCE, TCS, HDFCBANK...');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Search unavailable. Check backend.');
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, token, API_BASE]);

  // Stock quote and history
  useEffect(() => {
    if (!selectedStock) return;
    setError('');
    fetchStockInfo(selectedStock);
    fetchStockHistory(selectedStock, timeframe);
  }, [selectedStock, timeframe]);

  const fetchStockInfo = async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/market-data/quote/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.quote && response.data.success) {
        setStockInfo(response.data.quote);
        setDataSource(response.data.source || 'unknown');
        setChartCurrency(response.data.quote.currency || 'INR');
      } else {
        setStockInfo(null);
        setError(`Quote not found for ${symbol}. Try NSE symbols like RELIANCE`);
      }
    } catch (err) {
      setStockInfo(null);
      setError('Quote API down. Check /market-data/quote/:symbol endpoint');
      console.error('Error fetching stock info:', err);
    }
  };

  const fetchStockHistory = async (symbol, period) => {
    setLoading(true);
    setStockData([]);
    try {
      const response = await axios.get(`${API_BASE}/market-data/history/${symbol}?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.history && response.data.success) {
        setStockData(response.data.history);
        setDataSource(response.data.source || 'unknown');
        setChartCurrency(response.data.currency || 'INR');

        const avgPrice = response.data.history.reduce((sum, d) => sum + d.price, 0) / response.data.history.length;
        console.log(`📊 Chart loaded: ${response.data.history.length} points, Avg: ${formatCurrency(avgPrice)}`);
      } else {
        setStockData([]);
        setError(`No history for ${symbol}. Check /market-data/history/${symbol} endpoint`);
      }
    } catch (err) {
      setStockData([]);
      setError('History API error. Verify backend route');
      console.error('Error fetching stock history:', err);
    }
    setLoading(false);
  };

  const handleSearchSelect = (stock) => {
    setSelectedStock(stock.symbol);
    setSearch(stock.symbol);
    setSuggestions([]);
    setError('');
  };

  const addToWatchlist = () => {
    if (selectedStock && !watchlist.includes(selectedStock)) {
      setWatchlist([...watchlist, selectedStock]);
      localStorage.setItem('watchlist', JSON.stringify([...watchlist, selectedStock]));
    }
  };

  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(s => s !== symbol);
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load watchlist');
      }
    }
  }, []);


  return (
    <div style={{ padding: '30px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#202124', margin: 0 }}>📈 Stock Market</h1>
          {dataSource && (
            <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '5px' }}>
              Data source: <span style={{ fontWeight: '600', color: '#1a73e8' }}>{dataSource}</span>
              {stockInfo && stockInfo.currency && (
                <> • Currency: <span style={{ fontWeight: '600', color: '#34a853' }}>{stockInfo.currency}</span></>
              )}
            </div>
          )}
        </div>
        <div style={{ position: 'relative', width: 320 }}>
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            style={{
              padding: '12px 16px',
              border: '2px solid #dadce0',
              borderRadius: '25px',
              fontSize: '14px',
              width: '300px'
            }}
            onChange={e => {
              setSearch(e.target.value.toUpperCase());
              setError(''); // 👈 Clear error on type
              setSelectedStock(''); // 👈 Clear chart until select
              if (e.target.value.length === 0) {
                setSuggestions([]);
              }
            }}

          />
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 46,
              background: 'white',
              border: '1px solid #dadce0',
              borderRadius: 8,
              zIndex: 10,
              maxHeight: 220,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map(s => (
                <div
                  key={s.symbol}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f3f4',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseDown={() => handleSearchSelect(s)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.symbol}</div>
                  <div style={{ color: '#5f6368', fontSize: '12px' }}>{s.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: '10px 0',
          color: '#d93025',
          background: '#fef2f2',
          borderRadius: 8,
          padding: 14,
          border: '1px solid #fecaca'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        {/* Main Chart Area */}
        <div>
          {/* Stock Header */}
          {selectedStock && stockInfo && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {selectedStock.substring(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#202124' }}>
                    {selectedStock}
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#5f6368' }}>
                    {stockInfo.companyName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '3px' }}>
                    {stockInfo.exchange} • {stockInfo.currency}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#202124' }}>
                  {formatCurrency(stockInfo.currentPrice)}
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: (stockInfo.change || 0) >= 0 ? '#137333' : '#d93025'
                }}>
                  {(stockInfo.change || 0) >= 0 ? '+' : ''}
                  {formatCurrency(stockInfo.change)} ({(stockInfo.changePercent || 0).toFixed(2)}%)
                </div>
              </div>
              <button
                onClick={addToWatchlist}
                disabled={watchlist.includes(selectedStock)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: watchlist.includes(selectedStock) ? '#dadce0' : '#34a853',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: watchlist.includes(selectedStock) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {watchlist.includes(selectedStock) ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
          )}

          {/* Chart */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#202124' }}>Price Chart</h3>
                {stockData.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '5px' }}>
                    {stockData.length} data points • All prices in {chartCurrency}
                  </div>
                )}
              </div>
              <div>
                {['1W', '1M', '3M', '6M', '1Y'].map(period => (
                  <button
                    key={period}
                    style={{
                      padding: '8px 16px',
                      margin: '0 4px',
                      borderRadius: '20px',
                      background: timeframe === period ? '#1a73e8' : 'white',
                      color: timeframe === period ? 'white' : '#5f6368',
                      border: `1px solid ${timeframe === period ? '#1a73e8' : '#dadce0'}`,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5f6368'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                  <div>Loading chart data...</div>
                </div>
              </div>
            ) : stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                  <XAxis
                    dataKey="date"
                    stroke="#5f6368"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#5f6368"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value) => [formatCurrency(value), 'Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#ea4335"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#ea4335' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5f6368',
                fontSize: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
                  <div>Select a stock to view price chart</div>
                </div>
              </div>
            )}
          </div>

          {/* Stock Details */}
          {selectedStock && stockInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#202124' }}>Stock Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '5px' }}>Volume</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                    {(stockInfo?.volume || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '5px' }}>Market Cap</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                    {stockInfo?.marketCap > 0
                      ? formatCurrency(stockInfo.marketCap / 1e9) + 'B'
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '5px' }}>P/E Ratio</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                    {(15 + Math.random() * 20).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Watchlist */}
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#202124' }}>📋 Watchlist</h3>
            {watchlist.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#5f6368',
                padding: '40px 20px',
                fontSize: '14px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                <div>Your watchlist is empty</div>
                <div style={{ marginTop: '5px' }}>Search and add stocks to track</div>
              </div>
            ) : (
              watchlist.map((symbol) => (
                <div
                  key={symbol}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: symbol === selectedStock ? '#e8f0fe' : 'white',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: `2px solid ${symbol === selectedStock ? '#1a73e8' : 'transparent'}`
                  }}
                  onClick={() => {
                    setSelectedStock(symbol);
                    setSearch(symbol);
                  }}
                  onMouseEnter={(e) => {
                    if (symbol !== selectedStock) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (symbol !== selectedStock) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#202124' }}>
                      {symbol}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '3px' }}>
                      Click to view details
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeFromWatchlist(symbol);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d93025',
                      cursor: 'pointer',
                      fontSize: 20,
                      fontWeight: 'bold',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
