import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('india');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  useEffect(() => {
    fetchNews(true);
    // eslint-disable-next-line
  }, [selectedCategory]);

  useEffect(() => {
    if (page > 1) {
      fetchNews();
    }
    // eslint-disable-next-line
  }, [page]);

  const fetchNews = async (reset = false) => {
    setLoading(true);

    try {
      let endpoint = '';
      let params = { page };

      if (selectedCategory === 'india') {
        endpoint = `${API_BASE}/news/india`;
      } else if (selectedCategory === 'us') {
        endpoint = `${API_BASE}/news/us`;
      } else if (selectedCategory === 'trading-news') {
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

        setNews(prev =>
          reset ? newArticles : [...prev, ...newArticles]
        );

        setHasMore(newArticles.length > 0);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setPage(1);
    setNews([]);
    setSelectedCategory('search');
    fetchNews(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Styles (same as yours)
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
    transition: '0.2s ease',
    cursor: 'pointer'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  };

  const contentStyle = {
    padding: '20px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📰 Stock Market News</h1>

        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Search stocks, companies..."
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

      {/* Categories */}
      <div style={categoryStyle}>
        {['india', 'us', 'trading-news', 'crypto'].map(category => (
          <button
            key={category}
            style={
              selectedCategory === category
                ? activeCategoryStyle
                : categoryButtonStyle
            }
            onClick={() => {
              setSelectedCategory(category);
              setPage(1);
              setNews([]);
            }}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading && news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading latest market news...
        </div>
      ) : (
        <>
          <div style={newsGridStyle}>
            {news.map((article, index) => (
              <div
                key={index}
                style={articleCardStyle}
                onClick={() => window.open(article.url, '_blank')}
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    style={imageStyle}
                  />
                )}

                <div style={contentStyle}>
                  <h3>{article.title}</h3>

                  <p>
                    {article.description?.substring(0, 120)}...
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#666'
                  }}>
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
                style={{ ...buttonStyle, backgroundColor: '#34a853' }}
                onClick={handleLoadMore}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;