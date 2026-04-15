import React from 'react';
const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" style={{
        background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}>
            Meet Our Team
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', lineHeight: '1.6' }}>
            Four passionate Computer Engineering students from KSOE, working together to revolutionize
            financial education through AI-driven innovation
          </p>
        </div>
      </section>

      {/* Project Overview */}
      <section className="project-overview" style={{ padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#202124', fontWeight: '600' }}>
              About Artha-Mantra
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#5f6368', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
              An AI-driven investment simulator and portfolio management platform designed to bridge the gap
              between theoretical financial knowledge and practical trading skills
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#202124' }}>Our Mission</h3>
              <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
                To democratize financial education by providing a risk-free, AI-powered trading environment
                that helps users learn and practice without financial risk
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#202124' }}>Our Vision</h3>
              <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
                To become the leading platform for financial education, reducing investment losses
                and creating more informed, successful traders worldwide
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💡</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#202124' }}>Our Innovation</h3>
              <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
                Combining real-time market data, AI-powered recommendations, and comprehensive
                portfolio management in one unified educational platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="team-members" style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#202124', fontWeight: '600' }}>
              Our Development Team
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#5f6368', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Meet the talented Computer Engineering students behind Artha-Mantra
            </p>
          </div>

          {/* FOUR CARDS IN ONE LINE */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              justifyContent: 'center',
              alignItems: 'stretch',
              flexWrap: 'nowrap',
              marginBottom: '60px'
            }}
          >
            {/* Gunwant Patil - Team Lead */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              minWidth: '280px',
              maxWidth: '320px',
              flex: '1'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}>
              <div style={{ padding: '40px 30px 30px', textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  border: '4px solid #1a73e8',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/team-photos/gunwantphoto.jpeg"
                    alt="Gunwant Patil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '15px'
                }}>
                  Project Lead
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#202124', fontWeight: '600' }}>
                  Gunwant Patil
                </h3>
                <p style={{ color: '#5f6368', fontSize: '0.95rem', marginBottom: '15px' }}>
                  Computer Engineering | KSOE
                </p>
                <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Full-stack developer specializing in React.js and Node.js. Passionate about fintech
                  innovation and creating user-centric solutions.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    React.js
                  </span>
                  <span style={{
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Node.js
                  </span>
                  <span style={{
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    MongoDB
                  </span>
                </div>
              </div>
            </div>

            {/* Devesh Patil */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              minWidth: '280px',
              maxWidth: '320px',
              flex: '1'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}>
              <div style={{ padding: '40px 30px 30px', textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  border: '4px solid #34a853',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/team-photos/devesh-patil-new.jpg"
                    alt="Devesh Patil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: '#34a853',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '15px'
                }}>
                  Chatbot Integration
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#202124', fontWeight: '600' }}>
                  Devesh Patil
                </h3>
                <p style={{ color: '#5f6368', fontSize: '0.95rem', marginBottom: '15px' }}>
                  Computer Engineering | KSOE
                </p>
                <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Web development enthusiast specializing in chatbot integration and intelligent recommendation systems. 
                  Skilled in AI integration through OpenAI API key.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#e6f7e6',
                    color: '#34a853',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    REST APIs
                  </span>
                  <span style={{
                    backgroundColor: '#e6f7e6',
                    color: '#34a853',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    OpenAI Integration
                  </span>
                  <span style={{
                    backgroundColor: '#e6f7e6',
                    color: '#34a853',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Chatbot Systems
                  </span>
                </div>
              </div>
            </div>

            {/* Gitesh Patil*/}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              minWidth: '280px',
              maxWidth: '320px',
              flex: '1'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}>
              <div style={{ padding: '40px 30px 30px', textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  border: '4px solid #ea4335',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/team-photos/gitesh-final.png"
                    alt="Gitesh Patil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: '#ea4335',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '15px'
                }}>
                  Backend Developer
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#202124', fontWeight: '600' }}>
                  Gitesh Patil
                </h3>
                <p style={{ color: '#5f6368', fontSize: '0.95rem', marginBottom: '15px' }}>
                  Computer Engineering | KSOE
                </p>
                <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Backend architecture specialist focusing on API development, database optimization,
                  and real-time data integration.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#fce8e6',
                    color: '#ea4335',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Express.js
                  </span>
                  <span style={{
                    backgroundColor: '#fce8e6',
                    color: '#ea4335',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    APIs
                  </span>
                  <span style={{
                    backgroundColor: '#fce8e6',
                    color: '#ea4335',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Database
                  </span>
                </div>
              </div>
            </div>

            {/* Suyash Kutwal */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              minWidth: '280px',
              maxWidth: '320px',
              flex: '1'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}>
              <div style={{ padding: '40px 30px 30px', textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  border: '4px solid #ff9800',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/team-photos/suyash-kutwal-new.jpg"
                    alt="Suyash Kutwal"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '15px'
                }}>
                  UI/UX Designer
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#202124', fontWeight: '600' }}>
                  Suyash Kutwal
                </h3>
                <p style={{ color: '#5f6368', fontSize: '0.95rem', marginBottom: '15px' }}>
                  Computer Engineering | KSOE
                </p>
                <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Frontend developer and UI/UX designer focused on creating intuitive user experiences
                  and responsive web design.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#fff3e0',
                    color: '#ff9800',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    UI/UX
                  </span>
                  <span style={{
                    backgroundColor: '#fff3e0',
                    color: '#ff9800',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    CSS
                  </span>
                  <span style={{
                    backgroundColor: '#fff3e0',
                    color: '#ff9800',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Design
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Details Section */}
      <section className="tech-details" style={{ padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#202124', fontWeight: '600' }}>
              Project Highlights
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#5f6368', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Key features and technologies that make Artha-Mantra unique
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px 25px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🤖</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#202124' }}>AI-Powered Chatbot</h3>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Intelligent trading assistant using OpenAI GPT-3.5
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '30px 25px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📊</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#202124' }}>Real-time Data</h3>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Live market data integration with Alpha Vantage API
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '30px 25px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>💰</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#202124' }}>Virtual Trading</h3>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Risk-free trading simulation with virtual money
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '30px 25px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📈</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#202124' }}>Smart Analytics</h3>
              <p style={{ color: '#5f6368', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Advanced portfolio analytics and performance tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guidance Section */}
      <section className="guidance" style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#202124', fontWeight: '600' }}>
            Under the Guidance of
          </h2>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            {/* <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👨‍🏫</div> */}
            <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#202124', fontWeight: '600' }}>
              Prof. P. N. Railkar
            </h3>
            <p style={{ color: '#5f6368', fontSize: '1.1rem', marginBottom: '20px' }}>
              Project Guide | Computer Engineering Department
            </p>
            <p style={{ color: '#5f6368', fontSize: '1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
              "Guiding the next generation of engineers to build innovative solutions that make a real impact on society"
            </p>
          </div>
        </div>
      </section>


      {/* College Information */}

      <section className="college-info" style={{
        padding: '60px 0',
        background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <img
                src="/ksoe-logo.png"
                alt="KSOE Logo"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                  marginBottom: '10px'
                }}
              />
            </div>

          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '15px', fontWeight: '600' }}>
            Keystone School of Engineering (KSOE)
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '15px', opacity: '0.9' }}>
            Computer Engineering Department
          </p>
          <p style={{ fontSize: '1rem', opacity: '0.8' }}>
            BE Project 2025-26 | Final Year Project
          </p>
        </div>
      </section>

    </div>
  );
};

export default About;
