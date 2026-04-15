import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import TopPerformersComponent from '../components/TopPerformersComponent';
import axios from 'axios';


const Dashboard = () => {
  const { user, token } = useAuth();
  const { isConnected } = useSocket();

  // State for real data
  const [portfolios, setPortfolios] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalValue: 0,
    totalProfitLoss: 0,
    availableCash: 0,
    totalTrades: 0,
    winRate: 0,
    bestPerformer: null
  });


  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';


  // Format currency in INR
  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // redirect first time users to guidelines page
  useEffect(() => {
    const guidelinesAccepted = localStorage.getItem("guidelinesAccepted");
    if (!guidelinesAccepted) {
      window.location.href = "/guidelines";
    }
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch portfolios
      const portfolioResponse = await axios.get(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const portfolioList = portfolioResponse.data.portfolios || [];
      setPortfolios(portfolioList);


      // Fetch recent trades
      const tradesResponse = await axios.get(`${API_BASE}/trading/history?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trades = tradesResponse.data.trades || [];
      setRecentTrades(trades.slice(0, 5));


      // Calculate dashboard stats
      if (portfolioList.length > 0) {
        const totalValue = portfolioList.reduce((sum, p) => sum + (p.currentValue || p.initialAmount || 0), 0);
        const totalProfitLoss = portfolioList.reduce((sum, p) => sum + (p.totalProfitLoss || 0), 0);
        const availableCash = portfolioList.reduce((sum, p) => sum + (p.availableCash || 0), 0);

        // Find best performing holding
        let bestPerformer = null;
        let maxReturn = -Infinity;

        portfolioList.forEach(portfolio => {
          if (portfolio.holdings) {
            portfolio.holdings.forEach(holding => {
              const returnPct = holding.profitLossPercentage || 0;
              if (returnPct > maxReturn) {
                maxReturn = returnPct;
                bestPerformer = {
                  symbol: holding.symbol,
                  returnPct: returnPct,
                  profitLoss: holding.profitLoss
                };
              }
            });
          }
        });


        // Calculate win rate (only SELL trades with realized profit)
        const sellTrades = trades.filter(
          trade => trade.type === 'SELL' && trade.status === 'EXECUTED'
        );

        const winCount = sellTrades.filter(
          trade => trade.realizedProfit > 0
        ).length;

        const totalCount = sellTrades.length;

        const winRate = totalCount > 0
          ? (winCount / totalCount) * 100
          : 0;



        setDashboardStats({
          totalValue,
          totalProfitLoss,
          availableCash,
          totalTrades: tradesResponse.data.pagination?.total || trades.length,
          winRate,
          bestPerformer
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  // Styles
  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  };


  const headerStyle = {
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e0e0e0'
  };


  const titleStyle = {
    fontSize: '2.5rem',
    color: '#202124',
    marginBottom: '10px',
    fontWeight: '700'
  };


  const subtitleStyle = {
    fontSize: '1.1rem',
    color: '#5f6368'
  };


  const connectionStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '20px',
    backgroundColor: isConnected ? '#e8f5e8' : '#fce8e8',
    color: isConnected ? '#137333' : '#d93025',
    fontSize: '14px',
    fontWeight: '500'
  };


  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isConnected ? '#137333' : '#d93025',
    animation: isConnected ? 'pulse 2s infinite' : 'none'
  };


  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  };


  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f1f3f4',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };


  const cardHoverStyle = {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  };


  const cardTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#5f6368',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };


  const statValueStyle = {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#202124',
    marginBottom: '8px'
  };


  const statChangeStyle = {
    fontSize: '0.9rem',
    fontWeight: '500'
  };


  const tradeItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #f1f3f4',
    transition: 'background-color 0.2s'
  };


  const sectionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    marginTop: '20px'
  };


  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ color: '#5f6368' }}>📊 Loading dashboard...</h3>
        </div>
      </div>
    );
  }


  const stats = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(dashboardStats.totalValue),
      change: dashboardStats.totalProfitLoss >= 0
        ? `+${formatCurrency(dashboardStats.totalProfitLoss)}`
        : `${formatCurrency(dashboardStats.totalProfitLoss)}`,
      changePercent: dashboardStats.totalValue > 0
        ? ((dashboardStats.totalProfitLoss / (dashboardStats.totalValue - dashboardStats.totalProfitLoss)) * 100).toFixed(2)
        : 0,
      isPositive: dashboardStats.totalProfitLoss >= 0,
      icon: '💰'
    },
    {
      title: "Total P&L",
      value: dashboardStats.totalProfitLoss >= 0
        ? `+${formatCurrency(dashboardStats.totalProfitLoss)}`
        : `${formatCurrency(Math.abs(dashboardStats.totalProfitLoss))}`,
      change: `${dashboardStats.totalValue > 0 ? ((dashboardStats.totalProfitLoss / (dashboardStats.totalValue - dashboardStats.totalProfitLoss)) * 100).toFixed(2) : 0}%`,
      changePercent: dashboardStats.totalValue > 0
        ? ((dashboardStats.totalProfitLoss / (dashboardStats.totalValue - dashboardStats.totalProfitLoss)) * 100).toFixed(2)
        : 0,
      isPositive: dashboardStats.totalProfitLoss >= 0,
      icon: '📈'
    },
    {
      title: 'Available Cash',
      value: formatCurrency(dashboardStats.availableCash),
      change: 'Ready to trade',
      changePercent: null,
      isPositive: null,
      icon: '💵'
    },
    {
      title: 'Win Rate',
      value: `${dashboardStats.winRate.toFixed(1)}%`,
      change: `${Math.round(dashboardStats.totalTrades * (dashboardStats.winRate / 100))} wins`,
      changePercent: null,
      isPositive: dashboardStats.winRate > 50 ? true : dashboardStats.winRate > 0 ? null : false,
      icon: '🎯'
    }
  ];


  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
      `}</style>


      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={titleStyle}>Welcome back, {user?.firstName || 'Trader'}! 👋</h1>
            <p style={subtitleStyle}>Here's your trading overview for today</p>
          </div>
          <div style={connectionStyle}>
            <span style={dotStyle}></span>
            {isConnected ? '🟢 Live Data Connected' : '🔴 Connection Lost'}
          </div>
        </div>
      </div>


      {/* Key Metrics Grid */}
      <div style={gridStyle}>
        {stats.map((stat, index) => (
          <div key={index} style={cardStyle} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
            <h3 style={cardTitleStyle}>{stat.title}</h3>
            <div style={statValueStyle}>{stat.value}</div>
            <div style={{
              ...statChangeStyle,
              color: stat.isPositive === true ? '#137333' :
                stat.isPositive === false ? '#d93025' : '#5f6368'
            }}>
              {stat.change} {stat.changePercent !== null && `(${stat.changePercent}%)`}
            </div>
          </div>
        ))}
      </div>


      {/* 🔥 TOP PERFORMERS COMPONENT - ADDED HERE */}
      <TopPerformersComponent />


      {/* Recent Activity & Best Performer */}
      <div style={sectionsGridStyle}>
        {/* Recent Activity */}
        <div style={cardStyle}>
          <h3 style={{ ...cardTitleStyle, fontSize: '1.1rem' }}>📊 Recent Activity</h3>
          {recentTrades.length > 0 ? (
            <div>
              {recentTrades.map((trade, index) => (
                <div
                  key={index}
                  style={tradeItemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#202124' }}>
                      {trade.type === 'BUY' ? '🔵' : '🔴'} {trade.type} {trade.quantity} {trade.symbol}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>
                      {new Date(trade.createdAt).toLocaleDateString()} at {formatCurrency(trade.price)}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: '600',
                    color: trade.type === 'BUY' ? '#d93025' : '#137333',
                    fontSize: '14px'
                  }}>
                    {trade.type === 'BUY' ? '-' : '+'}
                    {formatCurrency(trade.totalAmount || 0)}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '16px' }}>
                <Link
                  to="/trading"
                  style={{
                    display: 'inline-block',
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  View all trades →
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5f6368' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
              <p>No trades yet. Start trading to see activity here!</p>
            </div>
          )}
        </div>


        {/* Best Performer */}
        <div style={cardStyle}>
          <h3 style={{ ...cardTitleStyle, fontSize: '1.1rem' }}>🏆 Best Performer</h3>
          {dashboardStats.bestPerformer ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                {dashboardStats.bestPerformer.returnPct > 0 ? '📈' : '📉'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#202124', marginBottom: '8px' }}>
                {dashboardStats.bestPerformer.symbol}
              </div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: dashboardStats.bestPerformer.returnPct > 0 ? '#137333' : '#d93025',
                marginBottom: '4px'
              }}>
                {dashboardStats.bestPerformer.returnPct > 0 ? '+' : ''}
                {dashboardStats.bestPerformer.returnPct.toFixed(2)}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5f6368' }}>
                {formatCurrency(dashboardStats.bestPerformer.profitLoss || 0)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5f6368' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
              <p>No holdings yet. Buy some stocks to see top performers!</p>
            </div>
          )}
        </div>
      </div>


      {/* Portfolio Overview */}
      {portfolios.length > 0 && (
        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <h3 style={{ ...cardTitleStyle, fontSize: '1.1rem' }}>💼 Portfolio Overview</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {portfolios.slice(0, 3).map((portfolio, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#202124', marginBottom: '8px' }}>
                  {portfolio.name}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1a73e8', marginBottom: '4px' }}>
                  {formatCurrency(portfolio.currentValue || 0)}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: (portfolio.totalProfitLoss || 0) >= 0 ? '#137333' : '#d93025',
                  fontWeight: '500'
                }}>
                  {(portfolio.totalProfitLoss || 0) >= 0 ? '+' : ''}
                  {formatCurrency(portfolio.totalProfitLoss || 0)}
                  ({(portfolio.totalProfitLossPercentage || 0).toFixed(2)}%)
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '8px' }}>
                  {portfolio.holdings?.length || 0} holdings
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <Link
          to="/portfolio"
          style={{
            backgroundColor: '#1a73e8',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1557b0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a73e8'}
        >
          📋 Manage Portfolio
        </Link>
        <Link
          to="/trading"
          style={{
            backgroundColor: '#34a853',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2d8e47'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#34a853'}
        >
          🚀 Start Trading
        </Link>
        <Link
          to="/market"
          style={{
            backgroundColor: '#fbbc04',
            color: '#202124',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9a825'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#fbbc04'}
        >
          📊 View Market
        </Link>
        <Link
          to="/analytics"
          style={{
            backgroundColor: '#ea4335',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#d33425'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ea4335'}
        >
          📈 Analytics
        </Link>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: 'white',
            color: '#5f6368',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '2px solid #dadce0',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#5f6368';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dadce0';
          }}
        >
          🔄 Refresh
        </button>
      </div>


      {/* Footer Stats */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', color: '#5f6368', fontSize: '14px' }}>
        <p>
          Showing data for {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} with {dashboardStats.totalTrades} total trade{dashboardStats.totalTrades !== 1 ? 's' : ''} • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};


export default Dashboard;
