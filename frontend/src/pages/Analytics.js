import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const Analytics = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [trades, setTrades] = useState([]);
  const [currentHoldings, setCurrentHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [stockChartData, setStockChartData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [portfolioPerformanceData, setPortfolioPerformanceData] = useState([]);
  const [tradingVolumeData, setTradingVolumeData] = useState([]);
  const [stockDistributionData, setStockDistributionData] = useState([]);
  const [aiTrades, setAiTrades] = useState([]);

  const [analytics, setAnalytics] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    winRate: 0,
    avgGainPerTrade: 0,
    bestPerformingStock: null,
    worstPerformingStock: null,
    monthlyPerformance: []
  });

  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  // Format currency in INR
  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchHoldings(selectedPortfolio);
      fetchTrades(selectedPortfolio);
    }
  }, [selectedPortfolio]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockChartData(selectedStock, selectedTimeframe);
    }
  }, [selectedStock, selectedTimeframe]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const portfolioList = response.data.portfolios || [];
      setPortfolios(portfolioList);
      if (portfolioList.length > 0) {
        setSelectedPortfolio(portfolioList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async (portfolioId) => {
    try {
      const response = await axios.get(`${API_BASE}/portfolio/${portfolioId}/holdings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const holdings = response.data.holdings || [];
      setCurrentHoldings(holdings);
      generateStockDistributionData(holdings);
      calculateHoldingsAnalytics(holdings);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  };

  const fetchTrades = async (portfolioId) => {
    try {
      const response = await axios.get(`${API_BASE}/trading/history?portfolioId=${portfolioId}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tradeList = response.data.trades || [];
      setTrades(tradeList);

      const tradesWithAI = tradeList.filter(trade => trade.aiAnalysis);
      setAiTrades(tradesWithAI);

      calculateTradeAnalytics(tradeList);
      generateChartData(tradeList);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const generateStockDistributionData = (holdings) => {
    if (holdings.length === 0) {
      setStockDistributionData([]);
      setSelectedStock('');
      return;
    }

    const distributionData = holdings.map(holding => ({
      name: holding.symbol,
      value: holding.totalValue || 0,
      fill: getRandomColor()
    }));

    setStockDistributionData(distributionData);

    // Set first stock as selected for chart
    if (!selectedStock && holdings.length > 0) {
      setSelectedStock(holdings[0].symbol);
    }
  };

  const calculateHoldingsAnalytics = (holdings) => {
    if (holdings.length === 0) {
      setAnalytics(prev => ({
        ...prev,
        bestPerformingStock: null,
        worstPerformingStock: null
      }));
      return;
    }

    // Sort by profit/loss percentage
    const sortedHoldings = [...holdings].sort((a, b) =>
      (b.profitLossPercentage || 0) - (a.profitLossPercentage || 0)
    );

    const bestStock = sortedHoldings[0];
    const worstStock = sortedHoldings[sortedHoldings.length - 1];

    setAnalytics(prev => ({
      ...prev,
      bestPerformingStock: {
        symbol: bestStock.symbol,
        profitLoss: bestStock.profitLoss || 0,
        profitLossPercentage: bestStock.profitLossPercentage || 0,
        currentPrice: bestStock.currentPrice || 0,
        quantity: bestStock.quantity || 0
      },
      worstPerformingStock: {
        symbol: worstStock.symbol,
        profitLoss: worstStock.profitLoss || 0,
        profitLossPercentage: worstStock.profitLossPercentage || 0,
        currentPrice: worstStock.currentPrice || 0,
        quantity: worstStock.quantity || 0
      }
    }));
  };

  const fetchStockChartData = async (symbol, timeframe) => {
    try {
      const data = generateMockStockData(symbol, timeframe);
      setStockChartData(data);
    } catch (error) {
      console.error('Error fetching stock chart data:', error);
    }
  };

  const generateMockStockData = (symbol, timeframe) => {
    const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
    const basePrice = 1000 + Math.random() * 2000; // INR range
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i));

      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      const price = i === 0 ? basePrice : data[i - 1].price * (1 + change);

      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: parseFloat((price * 1.02).toFixed(2)),
        low: parseFloat((price * 0.98).toFixed(2))
      });
    }
    return data;
  };

  const generateChartData = (tradeList) => {
    // Generate portfolio performance data
    const performanceData = [];
    let cumulativeValue = 100000;

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      const change = (Math.random() - 0.45) * 0.02;
      cumulativeValue *= (1 + change);

      performanceData.push({
        date: date.toLocaleDateString(),
        value: parseFloat(cumulativeValue.toFixed(2)),
        profit: parseFloat((cumulativeValue - 100000).toFixed(2))
      });
    }
    setPortfolioPerformanceData(performanceData);

    // Generate trading volume data
    const volumeData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    months.forEach(month => {
      volumeData.push({
        month,
        trades: Math.floor(Math.random() * 20) + 5,
        volume: Math.floor(Math.random() * 100000) + 10000
      });
    });
    setTradingVolumeData(volumeData);
  };

  const getRandomColor = () => {
    const colors = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9aa0a6', '#ff6d01', '#9c27b0'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const calculateTradeAnalytics = (tradeList) => {
    if (tradeList.length === 0) return;

    const buyTrades = tradeList.filter(t => t.type === 'BUY');
    const sellTrades = tradeList.filter(t => t.type === 'SELL');

    const totalTrades = tradeList.length;
    const totalProfit = sellTrades.reduce((sum, trade) => sum + trade.totalAmount, 0) -
      buyTrades.reduce((sum, trade) => sum + trade.totalAmount, 0);

    const successfulTrades = sellTrades.length;
    const winRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
    const avgGainPerTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;

    setAnalytics(prev => ({
      ...prev,
      totalTrades,
      successfulTrades,
      totalProfit,
      winRate,
      avgGainPerTrade
    }));
  };

  // Styles
  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '1400px',
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

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  };

  const chartCardStyle = {
    ...cardStyle,
    padding: '20px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const statCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };

  const timeframeButtonStyle = {
    padding: '8px 16px',
    margin: '0 4px',
    border: '1px solid #dadce0',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  };

  const activeTimeframeStyle = {
    ...timeframeButtonStyle,
    backgroundColor: '#1a73e8',
    color: 'white',
    borderColor: '#1a73e8'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h3>Loading analytics...</h3>
        </div>
      </div>
    );
  }

  const formatAIText = (text) => {
    if (!text) return "";

    // Remove markdown symbols
    let cleaned = text
      .replace(/#{1,6}\s?/g, '')      // remove ###
      .replace(/\*\*/g, '')           // remove **
      .replace(/---/g, '')            // remove ---
      .replace(/\*/g, '')             // remove stray *
      .trim();

    return cleaned;
  };

  const extractGrade = (text) => {
    const match = text?.match(/Grade:\s*([A-F])/i);
    return match ? match[1].toUpperCase() : null;
  };


  const renderAIAnalysis = (text) => {
    if (!text) return null;

    const cleaned = formatAIText(text);
    const lines = cleaned.split('\n').filter(l => l.trim() !== '');

    return lines.map((line, index) => {
      const lower = line.toLowerCase().trim();

      const sections = {
        'trade summary': '📌',
        'what went right': '✅',
        'what went wrong': '❌',
        'risk check': '🛡️',
        'what you should learn': '🎓',
        'final grade': '🏁'
      };

      const sectionKey = Object.keys(sections).find(key =>
        lower.startsWith(key)
      );

      // Section Headings
      if (sectionKey) {
        return (
          <div
            key={index}
            style={{
              marginTop: '25px',
              marginBottom: '12px',
              fontSize: '17px',
              fontWeight: '700',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{sections[sectionKey]}</span>
            <span>{line}</span>
          </div>
        );
      }

      // Bullet Points
      if (line.startsWith('•')) {
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '8px',
              paddingLeft: '12px',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#202124'
            }}
          >
            <span style={{ color: '#1a73e8', fontWeight: '700' }}>•</span>
            <span>{line.replace('•', '').trim()}</span>
          </div>
        );
      }

      // Highlight Grade Line
      if (lower.includes('grade')) {
        return (
          <div
            key={index}
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#e8f0fe',
              fontWeight: '700',
              color: '#1a73e8',
              fontSize: '15px'
            }}
          >
            {line}
          </div>
        );
      }

      // Normal text
      return (
        <div
          key={index}
          style={{
            marginBottom: '8px',
            fontSize: '14px',
            color: '#5f6368',
            lineHeight: '1.7'
          }}
        >
          {line}
        </div>
      );
    });
  };


  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📊 Advanced Trading Analytics</h1>
        {portfolios.length > 0 && (
          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #dadce0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            {portfolios.map(portfolio => (
              <option key={portfolio._id} value={portfolio._id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Key Metrics */}
      <div style={gridStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a73e8', marginBottom: '5px' }}>
            {analytics.totalTrades}
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Total Trades</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analytics.winRate >= 50 ? '#137333' : '#d93025', marginBottom: '5px' }}>
            {analytics.winRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Win Rate</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analytics.totalProfit >= 0 ? '#137333' : '#d93025', marginBottom: '5px' }}>
            {formatCurrency(analytics.totalProfit)}
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Total P&L</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: analytics.avgGainPerTrade >= 0 ? '#137333' : '#d93025', marginBottom: '5px' }}>
            {formatCurrency(analytics.avgGainPerTrade)}
          </div>
          <div style={{ fontSize: '14px', color: '#5f6368', fontWeight: '500' }}>Avg Gain/Trade</div>
        </div>
      </div>

      {/* Portfolio Performance Chart */}
      <div style={chartCardStyle}>
        <h3 style={{ marginBottom: '20px', color: '#202124' }}>📈 Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={portfolioPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
            <XAxis dataKey="date" stroke="#5f6368" fontSize={12} />
            <YAxis stroke="#5f6368" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1a73e8"
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Individual Stock Chart */}
        <div style={chartCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#202124', margin: 0 }}>
              📊 {selectedStock || 'Select Stock'} Price Chart
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <option value="">Select Stock</option>
                {currentHoldings.map(holding => (
                  <option key={holding.symbol} value={holding.symbol}>{holding.symbol}</option>
                ))}
              </select>

              <div>
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map(period => (
                  <button
                    key={period}
                    style={selectedTimeframe === period ? activeTimeframeStyle : timeframeButtonStyle}
                    onClick={() => setSelectedTimeframe(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {stockChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="date" stroke="#5f6368" fontSize={12} />
                <YAxis stroke="#5f6368" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ea4335"
                  strokeWidth={2}
                  dot={{ fill: '#ea4335', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ea4335' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368',
              fontSize: '16px'
            }}>
              Select a stock to view its chart
            </div>
          )}
        </div>

        {/* Stock Distribution Pie Chart */}
        <div style={chartCardStyle}>
          <h3 style={{ marginBottom: '20px', color: '#202124' }}>🥧 Portfolio Distribution</h3>
          {stockDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stockDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368'
            }}>
              No current holdings to display
            </div>
          )}
        </div>
      </div>

      {/* Trading Volume Chart */}
      <div style={chartCardStyle}>
        <h3 style={{ marginBottom: '20px', color: '#202124' }}>📊 Monthly Trading Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tradingVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
            <XAxis dataKey="month" stroke="#5f6368" fontSize={12} />
            <YAxis stroke="#5f6368" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="trades" fill="#1a73e8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Best Performer */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', color: '#202124' }}>🏆 Best Performer</h3>
          {analytics.bestPerformingStock ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#137333', marginBottom: '10px' }}>
                {analytics.bestPerformingStock.symbol}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#137333', marginBottom: '10px', fontWeight: '600' }}>
                +{analytics.bestPerformingStock.profitLossPercentage.toFixed(2)}%
              </div>
              <div style={{ fontSize: '1rem', color: '#5f6368', marginBottom: '15px' }}>
                Profit: <span style={{ color: '#137333', fontWeight: '600' }}>
                  {formatCurrency(analytics.bestPerformingStock.profitLoss)}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '10px' }}>
                Current: {formatCurrency(analytics.bestPerformingStock.currentPrice)} |
                Qty: {analytics.bestPerformingStock.quantity}
              </div>
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#137333',
                border: '1px solid #bbf7d0'
              }}>
                📈 Strong performer - Consider holding or increasing position
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
              No holdings data available
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', color: '#202124' }}>⚠️ Needs Attention</h3>
          {analytics.worstPerformingStock ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d93025', marginBottom: '10px' }}>
                {analytics.worstPerformingStock.symbol}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#d93025', marginBottom: '10px', fontWeight: '600' }}>
                {analytics.worstPerformingStock.profitLossPercentage.toFixed(2)}%
              </div>
              <div style={{ fontSize: '1rem', color: '#5f6368', marginBottom: '15px' }}>
                P&L: <span style={{ color: analytics.worstPerformingStock.profitLoss >= 0 ? '#137333' : '#d93025', fontWeight: '600' }}>
                  {formatCurrency(analytics.worstPerformingStock.profitLoss)}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '10px' }}>
                Current: {formatCurrency(analytics.worstPerformingStock.currentPrice)} |
                Qty: {analytics.worstPerformingStock.quantity}
              </div>
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#d93025',
                border: '1px solid #fecaca'
              }}>
                {analytics.worstPerformingStock.profitLoss < 0
                  ? '📉 Underperforming - Consider reviewing position or stop-loss'
                  : '⚠️ Lowest performer - Monitor closely'}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
              No holdings data available
            </div>
          )}
        </div>
      </div>



      {/* ================= AI TRADE INTELLIGENCE SECTION ================= */}
      <div style={{ ...cardStyle, marginTop: '50px' }}>
        <h2 style={{
          marginBottom: '25px',
          color: '#202124',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🤖 AI Trade Intelligence
        </h2>

        {aiTrades.length === 0 ? (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            color: '#5f6368',
            fontSize: '15px'
          }}>
            No AI reflections generated yet.
          </div>
        ) : (
          aiTrades.map((trade) => {
            const isProfit = trade.totalAmount >= 0;

            const cleanedText = formatAIText(trade.aiAnalysis || '')
              .replace(/Here’s a structured analysis.*?:/i, '')
              .replace(/#{1,6}\s?/g, '')
              .replace(/\*\*/g, '')
              .replace(/---/g, '')
              .trim();

            const grade = extractGrade(cleanedText);

            return (
              <div
                key={trade._id}
                style={{
                  marginBottom: '25px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}
              >

                {/* Header */}
                <div
                  style={{
                    padding: '18px 22px',
                    background: isProfit
                      ? 'linear-gradient(90deg, #e6f4ea, #ffffff)'
                      : 'linear-gradient(90deg, #fce8e6, #ffffff)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#202124'
                    }}>
                      {trade.symbol} — {trade.type}
                    </div>

                    <div style={{
                      fontSize: '13px',
                      marginTop: '4px',
                      color: '#5f6368'
                    }}>
                      Executed at ₹{trade.price}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isProfit ? '#137333' : '#d93025'
                  }}>
                    {formatCurrency(trade.totalAmount)}
                  </div>
                </div>

                {/* Body */}
                <details style={{ padding: '20px' }}>
                  <summary style={{
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '15px',
                    fontSize: '14px',
                    color: '#1a73e8'
                  }}>
                    📊 View Detailed AI Breakdown
                  </summary>

                  <div
                    style={{
                      maxHeight: '450px',
                      overflowY: 'auto',
                      padding: '24px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '16px',
                      border: '1px solid #e8eaed'
                    }}
                  >
                    {renderAIAnalysis(trade.aiAnalysis)}
                  </div>
                </details>


              </div>
            );
          })
        )}
      </div>


    </div>
  );
};

export default Analytics;
