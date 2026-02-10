import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TopPerformersComponent = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  useEffect(() => {
    fetchTopPerformers();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTopPerformers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopPerformers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/market-data/top-performers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTopPerformers(response.data.topPerformers || []);
        setBottomPerformers(response.data.bottomPerformers || []);
        setLastUpdated(new Date(response.data.lastUpdated).toLocaleTimeString());
        console.log('✅ Top performers fetched:', response.data.topPerformers.length, 'gainers');
      } else {
        setError('Failed to load performers');
      }
    } catch (err) {
      console.error('Error fetching top performers:', err);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f1f3f4'
  };

  const headerStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '20px'
  };

  const stockRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f4'
  };

  const symbolStyle = {
    fontWeight: '600',
    fontSize: '15px',
    color: '#202124'
  };

  const companyStyle = {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '2px'
  };

  const priceStyle = {
    fontSize: '14px',
    color: '#202124',
    fontWeight: '500'
  };

  if (error) {
    return (
      <div style={gridStyle}>
        <div style={{...cardStyle, gridColumn: '1 / -1', textAlign: 'center', color: '#d93025'}}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={gridStyle}>
        <div style={{...cardStyle, gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '24px', marginBottom: '10px'}}>📊</div>
          <div>Loading live market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {lastUpdated && (
        <div style={{
          fontSize: '12px',
          color: '#5f6368',
          marginBottom: '15px',
          textAlign: 'right'
        }}>
          Last updated: {lastUpdated} • Live NSE data
        </div>
      )}
      <div style={gridStyle}>
        {/* Top 5 Gainers */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>🔥 Top 5 Gainers Today</span>
            <button
              onClick={fetchTopPerformers}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
              title="Refresh"
            >
              🔄
            </button>
          </div>
          {topPerformers.length > 0 ? (
            topPerformers.slice(0, 5).map((stock, index) => (
              <div key={stock.symbol} style={stockRowStyle}>
                <div>
                  <div style={symbolStyle}>{index + 1}. {stock.symbol}</div>
                  <div style={companyStyle}>{stock.companyName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={priceStyle}>
                    {formatCurrency(stock.currentPrice)}
                  </div>
                  <div style={{ color: '#137333', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
                    ↑ {stock.todayChangePercent?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', color: '#5f6368', padding: '20px'}}>
              No data available
            </div>
          )}
        </div>

        {/* Top 5 Losers */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>📉 Top 5 Losers Today</span>
            <button
              onClick={fetchTopPerformers}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
              title="Refresh"
            >
              🔄
            </button>
          </div>
          {bottomPerformers.length > 0 ? (
            bottomPerformers.slice(0, 5).map((stock, index) => (
              <div key={stock.symbol} style={stockRowStyle}>
                <div>
                  <div style={symbolStyle}>{index + 1}. {stock.symbol}</div>
                  <div style={companyStyle}>{stock.companyName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={priceStyle}>
                    {formatCurrency(stock.currentPrice)}
                  </div>
                  <div style={{ color: '#d93025', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
                    ↓ {Math.abs(stock.todayChangePercent)?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', color: '#5f6368', padding: '20px'}}>
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPerformersComponent;
