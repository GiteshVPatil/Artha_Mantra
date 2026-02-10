import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trading-news');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [selectedCategory, page]);

  const fetchNews = async (reset = false) => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = { page };

      if (selectedCategory === 'trading-news') {
        endpoint = `${API_BASE}/news/trading-news`;
      } else if (searchQuery) {
        endpoint = `${API_BASE}/news/search`;
        params.q = searchQuery;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        const newArticles = response.data.articles || response.data.news || [];
        setNews(reset ? newArticles : [...news, ...newArticles]);
        setHasMore(response.data.hasMore !== false && newArticles.length > 0);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setNews([]);
    setSelectedCategory('search');
    fetchNews(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#202124',
    margin: 0
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  };

  const inputStyle = {
    padding: '12px 16px',
    border: '2px solid #dadce0',
    borderRadius: '25px',
    fontSize: '14px',
    width: '300px'
  };

  const buttonStyle = {
    padding: '12px 20px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  };

  const categoryStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const categoryButtonStyle = {
    padding: '8px 16px',
    border: '1px solid #dadce0',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const activeCategoryStyle = {
    ...categoryButtonStyle,
    backgroundColor: '#1a73e8',
    color: 'white',
    borderColor: '#1a73e8'
  };

  const newsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px',
    marginBottom: '30px'
  };

  const articleCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: '#f1f3f4'
  };

  const contentStyle = {
    padding: '20px'
  };

  const articleTitleStyle = {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '10px',
    lineHeight: '1.4'
  };

  const descriptionStyle = {
    color: '#5f6368',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '15px'
  };

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9aa0a6'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📰 Trading News</h1>
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Search news..."
            style={inputStyle}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button style={buttonStyle} onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div style={categoryStyle}>
        {['trading-news', 'market-updates', 'crypto', 'economy'].map(category => (
          <button
            key={category}
            style={selectedCategory === category ? activeCategoryStyle : categoryButtonStyle}
            onClick={() => {
              setSelectedCategory(category);
              setPage(1);
              setNews([]);
            }}
          >
            {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading && news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Loading latest news...</div>
        </div>
      ) : (
        <>
          <div style={newsGridStyle}>
            {news.map((article, index) => (
              <div
                key={`${article.id}-${index}`}
                style={articleCardStyle}
                onClick={() => window.open(article.url, '_blank')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                }}
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    style={imageStyle}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div style={contentStyle}>
                  <h3 style={articleTitleStyle}>{article.title}</h3>
                  {article.description && (
                    <p style={descriptionStyle}>
                      {article.description.length > 120
                        ? `${article.description.substring(0, 120)}...`
                        : article.description}
                    </p>
                  )}
                  <div style={metaStyle}>
                    <span>{article.source}</span>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && !loading && (
            <div style={{ textAlign: 'center' }}>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: '#34a853'
                }}
                onClick={handleLoadMore}
              >
                Load More News
              </button>
            </div>
          )}

          {loading && news.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div>Loading more news...</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;
