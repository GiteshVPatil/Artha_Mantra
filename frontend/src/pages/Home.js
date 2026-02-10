import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero Section with ONLY Background Image */}
      <section className="hero" style={{ 
        padding: '100px 0', 
        textAlign: 'center', 
        background: `url('/assets/images/clean-trading-hero.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        {/* Dark overlay ONLY for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }}></div>

        <div className="container" style={{ 
          position: 'relative', 
          zIndex: 2, 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '0 20px' 
        }}>
          <div className="hero-content">
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
              marginBottom: '20px', 
              color: 'white',
              fontWeight: '700',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)'
            }}>
              Welcome to <span className="brand-name">Artha-Mantra</span>
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
              marginBottom: '15px', 
              color: 'white',
              fontWeight: '300',
              textShadow: '0 2px 4px rgba(0,0,0,0.7)'
            }}>
              AI-Driven Investment Simulator and Portfolio Management Platform
            </p>
            <p style={{ 
              fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
              marginBottom: '40px', 
              maxWidth: '600px', 
              margin: '0 auto 40px',
              color: 'white',
              lineHeight: '1.6',
              textShadow: '0 2px 4px rgba(0,0,0,0.7)'
            }}>
              Learn stock market trading in a risk-free environment with advanced AI analytics,
              real-time market data, and comprehensive portfolio management tools.
            </p>
            <div className="hero-actions" style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/register" 
                    className="btn btn-primary" 
                    style={{ 
                      padding: '18px 36px', 
                      fontSize: '1.1rem',
                      backgroundColor: '#1a73e8',
                      color: 'white',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 32px rgba(26, 115, 232, 0.3)',
                      border: 'none',
                      minWidth: '180px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.backgroundColor = '#1557b0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.backgroundColor = '#1a73e8';
                    }}
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '18px 36px', 
                      fontSize: '1.1rem',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                      minWidth: '180px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '18px 36px', 
                    fontSize: '1.1rem',
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(26, 115, 232, 0.3)',
                    border: 'none',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.backgroundColor = '#1557b0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.backgroundColor = '#1a73e8';
                  }}
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" style={{ padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '20px',
            color: '#202124',
            fontWeight: '600'
          }}>
            Key Features
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            color: '#5f6368',
            maxWidth: '600px',
            margin: '0 auto 60px',
            lineHeight: '1.6'
          }}>
            Discover powerful tools designed to enhance your trading education and skills
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            {[
              { icon: '📈', title: 'Virtual Trading', desc: 'Practice trading with real market data without financial risk' },
              { icon: '🤖', title: 'AI Analytics', desc: 'Advanced sentiment analysis and price prediction using LSTM/CNN models' },
              { icon: '📊', title: 'Portfolio Management', desc: 'Comprehensive portfolio tracking with performance analytics' },
              { icon: '⚡', title: 'Real-time Data', desc: 'Live market data and instant portfolio updates' },
              { icon: '🎓', title: 'Educational Focus', desc: 'Learn trading concepts with guided tutorials and insights' },
              { icon: '💬', title: 'AI Assistant', desc: 'Get instant answers to trading questions with our intelligent chatbot' }
            ].map((feature, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '40px 30px', 
                  textAlign: 'center', 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{feature.icon}</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '15px', 
                  color: '#202124',
                  fontWeight: '600'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: '#5f6368', 
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      {!isAuthenticated && (
        <section className="cta" style={{ 
          padding: '80px 0', 
          background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)', 
          color: 'white', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '20px',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Ready to Start Your Trading Journey?
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              marginBottom: '40px',
              opacity: '0.95',
              lineHeight: '1.6'
            }}>
              Join thousands of students and professionals learning smart investing with our AI-powered platform
            </p>
            <Link 
              to="/register" 
              className="btn" 
              style={{ 
                backgroundColor: 'white', 
                color: '#1a73e8', 
                padding: '18px 36px', 
                fontSize: '1.1rem', 
                textDecoration: 'none', 
                borderRadius: '50px', 
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                minWidth: '200px',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 48px rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.3)';
              }}
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
