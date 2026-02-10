import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EducatorDashboard = () => {
  // ...state and utility functions unchanged...
  const [portfolios, setPortfolios] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sortBy, setSortBy] = useState('student');
  const [filterBy, setFilterBy] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { user, token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  useEffect(() => {
    if (user?.role === 'educator' || user?.role === 'admin') {
      fetchStudentPortfolios();
    } else {
      setMessage('Access denied. Educator or Admin role required.');
      setLoading(false);
    }
  }, [user]);

  const fetchStudentPortfolios = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/students-portfolios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPortfolios(response.data.portfolios);
        setOverallStats(response.data.overallStats);
      } else {
        setMessage('Failed to load student portfolios');
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setMessage(error.response?.data?.message || 'Server error while fetching portfolios');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = async (studentId) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/student-detail/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedStudentData(response.data);
        setShowDetailModal(true);
      } else {
        setMessage('Failed to load student details');
      }
    } catch (error) {
      console.error('Error fetching student detail:', error);
      setMessage('Error loading student details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSort = (criteria) => {
    const sorted = [...portfolios].sort((a, b) => {
      switch (criteria) {
        case 'student':
          return `${a.student.firstName} ${a.student.lastName}`.localeCompare(`${b.student.firstName} ${b.student.lastName}`);
        case 'profit':
          return b.totalProfitLoss - a.totalProfitLoss;
        case 'value':
          return b.currentValue - a.currentValue;
        case 'trades':
          return b.student.totalTrades - a.student.totalTrades;
        default:
          return 0;
      }
    });
    setPortfolios(sorted);
    setSortBy(criteria);
  };

  const getFilteredPortfolios = () => {
    switch (filterBy) {
      case 'profitable':
        return portfolios.filter(p => p.totalProfitLoss > 0);
      case 'loss':
        return portfolios.filter(p => p.totalProfitLoss < 0);
      case 'active':
        return portfolios.filter(p => p.student.totalTrades > 0);
      default:
        return portfolios;
    }
  };

  // ...styles unchanged...

  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = { marginBottom: '40px' };
  const titleStyle = { fontSize: '2.5rem', color: '#202124', margin: '0 0 10px 0' };
  const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' };
  const statCardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', textAlign: 'center' };
  const statNumberStyle = { fontSize: '2rem', fontWeight: 'bold', color: '#1a73e8', margin: '0' };
  const statLabelStyle = { fontSize: '14px', color: '#5f6368', marginTop: '5px' };
  const controlsStyle = { display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' };
  const thStyle = { backgroundColor: '#f8f9fa', padding: '15px 10px', textAlign: 'left', fontWeight: '600', color: '#202124', borderBottom: '2px solid #dadce0', cursor: 'pointer' };
  const tdStyle = { padding: '15px 10px', borderBottom: '1px solid #f1f3f4' };
  const buttonStyle = { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500' };
  const profitStyle = (value) => ({
    color: value >= 0 ? '#137333' : '#d93025',
    fontWeight: '600'
  });
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' };
  const modalStyle = { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h3>Loading student portfolios...</h3>
        </div>
      </div>
    );
  }

  if (message && !portfolios.length) {
    return (
      <div style={containerStyle}>
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#d93025',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3>{message}</h3>
          {message.includes('Access denied') && (
            <Link to="/dashboard" style={{ color: '#1a73e8' }}>
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  const filteredPortfolios = getFilteredPortfolios();

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {user?.role === 'admin' ? '👑 Admin Dashboard' : 'Educator Dashboard'}
        </h1>
        <p style={{ color: '#5f6368', fontSize: '1.1rem' }}>
          Monitor and analyze student portfolio performance
        </p>
      </div>

      {/* Overall Statistics */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <h2 style={statNumberStyle}>{overallStats.totalStudents}</h2>
          <p style={statLabelStyle}>Total Students</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statNumberStyle}>{overallStats.totalPortfolios}</h2>
          <p style={statLabelStyle}>Active Portfolios</p>
        </div>
        <div style={statCardStyle}>
          {/* Changed $ to ₹ */}
          <h2 style={statNumberStyle}>₹{parseInt(overallStats.averagePortfolioValue || 0).toLocaleString()}</h2>
          <p style={statLabelStyle}>Average Portfolio Value</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statNumberStyle}>{overallStats.totalProfitable}</h2>
          <p style={statLabelStyle}>Profitable Portfolios</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statNumberStyle}>{overallStats.activeStudents}</h2>
          <p style={statLabelStyle}>Active Traders</p>
        </div>
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <div>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #dadce0' }}
          >
            <option value="student">Student Name</option>
            <option value="profit">Profit/Loss</option>
            <option value="value">Portfolio Value</option>
            <option value="trades">Total Trades</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Filter by:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #dadce0' }}
          >
            <option value="all">All Portfolios</option>
            <option value="profitable">Profitable Only</option>
            <option value="loss">Loss Only</option>
            <option value="active">Active Traders</option>
          </select>
        </div>
        <button
          onClick={fetchStudentPortfolios}
          style={{
            ...buttonStyle,
            backgroundColor: '#34a853',
            color: 'white'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Portfolio Table */}
      {filteredPortfolios.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('student')}>
                Student {sortBy === 'student' && '↓'}
              </th>
              <th style={thStyle}>Portfolio</th>
              <th style={thStyle} onClick={() => handleSort('value')}>
                Current Value {sortBy === 'value' && '↓'}
              </th>
              <th style={thStyle} onClick={() => handleSort('profit')}>
                Profit/Loss {sortBy === 'profit' && '↓'}
              </th>
              <th style={thStyle}>P/L %</th>
              <th style={thStyle} onClick={() => handleSort('trades')}>
                Trades {sortBy === 'trades' && '↓'}
              </th>
              <th style={thStyle}>Success Rate</th>
              <th style={thStyle}>Holdings</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortfolios.map((portfolio, index) => (
              <tr key={portfolio.portfolioId} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={tdStyle}>
                  <div>
                    <strong>{portfolio.student.firstName} {portfolio.student.lastName}</strong>
                    <div style={{ fontSize: '12px', color: '#5f6368' }}>
                      {portfolio.student.email}
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div>
                    <strong>{portfolio.portfolioName}</strong>
                    {portfolio.description && (
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        {portfolio.description}
                      </div>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <strong>₹{portfolio.currentValue.toLocaleString()}</strong>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>
                    Initial: ₹{portfolio.initialAmount.toLocaleString()}
                  </div>
                </td>
                <td style={{ ...tdStyle, ...profitStyle(portfolio.totalProfitLoss) }}>
                  ₹{portfolio.totalProfitLoss.toLocaleString()}
                </td>
                <td style={{ ...tdStyle, ...profitStyle(portfolio.totalProfitLoss) }}>
                  {portfolio.totalProfitLossPercentage.toFixed(2)}%
                </td>
                <td style={tdStyle}>{portfolio.student.totalTrades}</td>
                <td style={tdStyle}>{portfolio.student.successRate}%</td>
                <td style={tdStyle}>{portfolio.holdingsCount}</td>
                <td style={tdStyle}>
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#1a73e8',
                      color: 'white'
                    }}
                    onClick={() => fetchStudentDetail(portfolio.student.id)}
                    disabled={detailLoading}
                  >
                    {detailLoading ? 'Loading...' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <h3>No portfolios found matching your criteria</h3>
          <p style={{ color: '#5f6368' }}>
            Try changing the filter or encourage students to create portfolios.
          </p>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudentData && (
        <div style={modalOverlayStyle} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDetailModal(false);
            setSelectedStudentData(null);
          }
        }}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#202124' }}>
                📊 Student Details: {selectedStudentData.student.firstName} {selectedStudentData.student.lastName}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudentData(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#5f6368'
                }}
              >
                ×
              </button>
            </div>
            {/* Student Info */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>👤 Student Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Name:</strong> {selectedStudentData.student.firstName} {selectedStudentData.student.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStudentData.student.email}
                </div>
                <div>
                  <strong>Joined:</strong> {new Date(selectedStudentData.student.joinedDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Last Login:</strong> {selectedStudentData.student.lastLogin
                    ? new Date(selectedStudentData.student.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
            {/* Performance Metrics */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>📈 Overall Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>Total Invested</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#202124' }}>
                    ₹{selectedStudentData.performanceMetrics.totalInvested.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>Current Value</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#202124' }}>
                    ₹{selectedStudentData.performanceMetrics.currentValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>Total P/L</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: selectedStudentData.performanceMetrics.totalProfitLoss >= 0 ? '#137333' : '#d93025'
                  }}>
                    ₹{selectedStudentData.performanceMetrics.totalProfitLoss.toLocaleString()}
                    ({selectedStudentData.performanceMetrics.profitLossPercentage}%)
                  </div>
                </div>
              </div>
            </div>
            {/* Portfolios */}
            <div style={{ marginBottom: '30px' }}>
              <h3>💼 Portfolios ({selectedStudentData.portfolios.length})</h3>
              {selectedStudentData.portfolios.map((portfolio, index) => (
                <div key={index} style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{portfolio.name}</strong>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        {portfolio.holdings?.length || 0} holdings
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600' }}>
                        ₹{(portfolio.currentValue || portfolio.initialAmount).toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: (portfolio.totalProfitLoss || 0) >= 0 ? '#137333' : '#d93025'
                      }}>
                        {(portfolio.totalProfitLoss || 0) >= 0 ? '+' : ''}
                        ₹{(portfolio.totalProfitLoss || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Trading History */}
            <div>
              <h3>📜 Recent Trading History ({selectedStudentData.trades.length} trades)</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedStudentData.trades.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Symbol</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Quantity</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentData.trades.map((trade, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                          <td style={{ padding: '8px' }}>
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: trade.type === 'BUY' ? '#e8f5e8' : '#fef2f2',
                              color: trade.type === 'BUY' ? '#137333' : '#d93025',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {trade.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px', fontWeight: '600' }}>{trade.symbol}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{trade.quantity}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>₹{trade.price.toFixed(2)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                            ₹{trade.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#5f6368', padding: '20px' }}>
                    No trading history yet
                  </p>
                )}
              </div>
            </div>
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: '#dadce0',
                  color: '#5f6368',
                  padding: '10px 20px'
                }}
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudentData(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducatorDashboard;
