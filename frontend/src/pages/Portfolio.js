import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import TopPerformersComponent from '../components/TopPerformersComponent';

const Portfolio = () => {
  // State management
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailedPortfolio, setDetailedPortfolio] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialAmount: 100000
  });

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

 useEffect(() => {
  fetchPortfolios();

  // 🔄 Auto refresh every 10 minutes
  const interval = setInterval(async () => {
    try {
      await axios.get(`${API_BASE}/portfolio/refresh-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchPortfolios();

      console.log("🔄 Portfolio auto-refreshed (10 min)");
    } catch (error) {
      console.error("Auto refresh failed:", error);
    }
  }, 10 * 60 * 1000); // 10 minutes

  return () => clearInterval(interval);
}, []);


  // 🔄 Auto refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Auto refreshing portfolio prices...');

        await axios.get(`${API_BASE}/portfolio/refresh-all`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await fetchPortfolios();
        console.log('✅ Portfolio auto refreshed');
      } catch (error) {
        console.log('⚠️ Auto refresh failed');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [token]);


  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolios(response.data.portfolios || []);
      setMessage(''); // Clear any previous messages
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setMessage('Error loading portfolios');
    } finally {
      setLoading(false);
    }
  };

  // Create new portfolio
  const handleCreatePortfolio = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage('Portfolio name is required');
      return;
    }

    if (formData.initialAmount < 1000) {
      setMessage('Initial amount must be at least ₹1,000');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/portfolio`, {
        name: formData.name,
        description: formData.description,
        initialAmount: parseFloat(formData.initialAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage(`✅ Portfolio "${formData.name}" created successfully!`);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          initialAmount: 100000
        });
        fetchPortfolios();
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setMessage(error.response?.data?.message || 'Error creating portfolio');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete portfolio handler
  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/portfolio/${portfolioToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage(`✅ Portfolio "${portfolioToDelete.name}" deleted successfully!`);
        setShowDeleteModal(false);
        setPortfolioToDelete(null);
        fetchPortfolios();
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      setMessage(`❌ ${error.response?.data?.message || 'Error deleting portfolio'}`);
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation
  const confirmDelete = (portfolio) => {
    setPortfolioToDelete(portfolio);
    setShowDeleteModal(true);
  };

  // ✅ UPDATED: Handle View Details with LIVE PRICE FETCHING
  const handleViewDetails = async (portfolio) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    setDetailedPortfolio(null);

    try {
      // ✅ CHANGE: Call /details endpoint instead of /:id
      console.log(`🔄 Fetching live prices for portfolio: ${portfolio.name}`);
      const response = await axios.get(
        `${API_BASE}/portfolio/${portfolio._id}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDetailedPortfolio(response.data.portfolio);
        console.log(`✅ Live prices loaded for ${portfolio.name}`);
      }
    } catch (error) {
      console.error('Error loading portfolio details:', error);
      setDetailedPortfolio(null);
      setMessage('❌ Error loading portfolio details with live prices.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Trade Now
  const handleTradeNow = (portfolio) => {
    navigate('/trading');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format currency in INR
  const formatCurrency = (value) => {
    return `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  // Styles
  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#202124',
    margin: 0
  };

  const buttonStyle = {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  };

  const messageStyle = {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: message.includes('✅') ? '#e8f5e8' : '#fef2f2',
    color: message.includes('✅') ? '#137333' : '#d93025',
    border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`
  };

  const portfolioCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const portfolioGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h3>Loading portfolios...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Portfolio Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{ ...buttonStyle, backgroundColor: '#34a853' }}
            onClick={async () => {
              await axios.get(`${API_BASE}/portfolio/refresh-all`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              await fetchPortfolios();
            }}
          >
            🔄 Refresh Portfolio
          </button>
          <button
            style={buttonStyle}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Portfolio
          </button>
        </div>
      </div>

      {message && <div style={messageStyle}>{message}</div>}

      {portfolios.length === 0 ? (
        <div style={emptyStateStyle}>
          <h3 style={{ fontSize: '1.5rem', color: '#202124', marginBottom: '15px' }}>
            No Portfolios Found
          </h3>
          <p style={{ color: '#5f6368', fontSize: '1.1rem', marginBottom: '30px' }}>
            Create your first portfolio to start trading and tracking your investments
          </p>
          <button
            style={buttonStyle}
            onClick={() => setShowCreateModal(true)}
          >
            Create Portfolio
          </button>
        </div>
      ) : (

        <div style={portfolioGridStyle}>
          {portfolios.map((portfolio, index) => (
            <div key={portfolio._id || index} style={portfolioCardStyle}>
              <h3 style={{ fontSize: '1.5rem', color: '#202124', marginBottom: '10px' }}>
                {portfolio.name}
              </h3>
              {portfolio.description && (
                <p style={{ color: '#5f6368', marginBottom: '20px' }}>
                  {portfolio.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ color: '#5f6368', fontSize: '14px' }}>Total Value</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#202124' }}>
                    {formatCurrency(portfolio.currentValue || portfolio.initialAmount || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#5f6368', fontSize: '14px' }}>Available Cash</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#137333' }}>
                    {formatCurrency(portfolio.availableCash || portfolio.initialAmount || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#5f6368', fontSize: '14px' }}>P&L</div>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: (portfolio.totalProfitLoss || 0) >= 0 ? '#137333' : '#d93025'
                  }}>
                    {formatCurrency(portfolio.totalProfitLoss || 0)}
                    ({(portfolio.totalProfitLossPercentage || 0).toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div style={{ color: '#5f6368', fontSize: '14px' }}>Holdings</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#202124' }}>
                    {(portfolio.holdings && portfolio.holdings.length) || 0} stocks
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#34a853',
                    fontSize: '12px',
                    padding: '8px 16px',
                    flex: 1
                  }}
                  onClick={() => handleViewDetails(portfolio)}
                >
                  View Details
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'transparent',
                    color: '#1a73e8',
                    border: '1px solid #1a73e8',
                    fontSize: '12px',
                    padding: '8px 16px',
                    flex: 1
                  }}
                  onClick={() => handleTradeNow(portfolio)}
                >
                  Trade Now
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#d93025',
                    fontSize: '12px',
                    padding: '8px 16px',
                    minWidth: '100px'
                  }}
                  onClick={() => confirmDelete(portfolio)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={(e) => {
          if (e.target === e.currentTarget) setShowCreateModal(false);
        }}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: '20px', color: '#202124' }}>Create New Portfolio</h2>

            <form onSubmit={handleCreatePortfolio}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter portfolio name (e.g., My Trading Portfolio)"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe your investment strategy..."
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Initial Amount (Virtual Money) *
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  style={inputStyle}
                  value={formData.initialAmount}
                  onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                  min="1000"
                  step="1000"
                  required
                />
                <div style={{ fontSize: '12px', color: '#5f6368' }}>
                  Minimum: ₹1,000. This is virtual money for practice trading.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#dadce0',
                    color: '#5f6368',
                    flex: 1
                  }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    backgroundColor: createLoading ? '#ccc' : '#1a73e8',
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                    flex: 1
                  }}
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && portfolioToDelete && (
        <div style={modalOverlayStyle} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDeleteModal(false);
            setPortfolioToDelete(null);
          }
        }}>
          <div style={{ ...modalStyle, maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '20px', color: '#d93025' }}>⚠️ Delete Portfolio</h2>

            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#202124' }}>
              Are you sure you want to delete <strong>"{portfolioToDelete.name}"</strong>?
            </p>

            <div style={{
              backgroundColor: '#fef2f2',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #fecaca'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#d93025' }}>
                <strong>Warning:</strong> This action cannot be undone.
              </p>
              {portfolioToDelete.holdings && portfolioToDelete.holdings.length > 0 && (
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#d93025' }}>
                  This portfolio has {portfolioToDelete.holdings.length} active holding(s).
                  Please sell all stocks before deleting.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: '#dadce0',
                  color: '#5f6368',
                  flex: 1
                }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setPortfolioToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: deleteLoading ? '#ccc' : '#d93025',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  flex: 1
                }}
                onClick={handleDeletePortfolio}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Details Modal - WITH LIVE PRICES */}
      {showDetailsModal && (
        <div style={modalOverlayStyle} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDetailsModal(false);
            setDetailedPortfolio(null);
            fetchPortfolios(); // Refresh after closing
          }
        }}>
          <div style={{ ...modalStyle, maxWidth: '800px' }}>
            {detailsLoading || !detailedPortfolio ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <h3>🔄 Loading live prices...</h3>
                <p style={{ color: '#5f6368', marginTop: 10 }}>
                  Fetching current market data for your holdings...
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 16, color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{detailedPortfolio.name}</span>
                  <span style={{
                    fontSize: 14,
                    color: '#5f6368',
                    fontWeight: 400
                  }}>
                    Created: {new Date(detailedPortfolio.createdAt).toLocaleDateString()}
                  </span>
                </h2>

                {detailedPortfolio.description && (
                  <p style={{ color: '#5f6368', marginBottom: 20, fontStyle: 'italic' }}>
                    {detailedPortfolio.description}
                  </p>
                )}

                {/* Key Metrics Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 20,
                  marginBottom: 20,
                  padding: 20,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8
                }}>
                  <div>
                    <div style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>Total Value</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#202124' }}>
                      {formatCurrency(detailedPortfolio.currentValue)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>Available Cash</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: "#137333" }}>
                      {formatCurrency(detailedPortfolio.availableCash)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>Total Invested</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#1a73e8' }}>
                      {formatCurrency(detailedPortfolio.totalInvested || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>P&L</div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 22,
                      color: (detailedPortfolio.totalProfitLoss || 0) >= 0 ? "#137333" : "#d93025"
                    }}>
                      {formatCurrency(detailedPortfolio.totalProfitLoss || 0)}
                      <span style={{ fontSize: 16, marginLeft: 4 }}>
                        ({(detailedPortfolio.totalProfitLossPercentage || 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #dadce0' }} />

                {/* Holdings Section */}
                <div>
                  <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 18, color: '#202124' }}>
                    📊 Holdings ({detailedPortfolio.holdings?.length || 0})
                  </div>
                  {detailedPortfolio.holdings && detailedPortfolio.holdings.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f1f3f4" }}>
                            <th style={{ padding: '10px 8px', textAlign: 'left' }}>Symbol</th>
                            <th style={{ padding: '10px 8px', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Avg Price</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Current</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total Value</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>P&L</th>
                            <th style={{ padding: '10px 8px', textAlign: 'center' }}>Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedPortfolio.holdings.map((h, i) => (
                            <tr key={i} style={{
                              textAlign: "center",
                              background: i % 2 === 0 ? "#fff" : "#fafafa",
                              borderBottom: '1px solid #e0e0e0'
                            }}>
                              <td style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'left', color: '#1a73e8' }}>
                                {h.symbol}
                              </td>
                              <td style={{ padding: '10px 8px' }}>{h.quantity}</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                {formatCurrency(h.averagePrice)}
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                {h.currentPrice ? formatCurrency(h.currentPrice) : '-'}
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                                {formatCurrency(h.totalValue)}
                              </td>
                              <td style={{
                                padding: '10px 8px',
                                textAlign: 'right',
                                color: h.profitLoss >= 0 ? "#137333" : "#d93025",
                                fontWeight: 600
                              }}>
                                {formatCurrency(h.profitLoss)}
                                <div style={{ fontSize: 12 }}>
                                  ({h.profitLossPercentage?.toFixed(2)}%)
                                </div>
                              </td>
                              <td style={{ padding: '10px 8px', fontSize: 12, color: '#5f6368' }}>
                                {h.lastUpdated ? new Date(h.lastUpdated).toLocaleTimeString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{
                      color: '#888',
                      fontStyle: 'italic',
                      marginTop: 12,
                      padding: 30,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 8
                    }}>
                      No stocks in portfolio. Start trading to build your holdings!
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', marginTop: 30 }}>
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#dadce0',
                      color: '#5f6368',
                      width: 120
                    }}
                    onClick={() => {
                      setShowDetailsModal(false);
                      setDetailedPortfolio(null);
                      fetchPortfolios(); // Refresh on close
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
