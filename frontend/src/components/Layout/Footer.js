import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dadce0',
    padding: '40px 0 20px',
    marginTop: '60px'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    marginBottom: '30px'
  };

  const sectionStyle = {
    color: '#202124'
  };

  const titleStyle = {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1a73e8'
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const listItemStyle = {
    marginBottom: '8px',
    color: '#5f6368'
  };

  const linkStyle = {
    color: '#5f6368',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px'
  };

  const bottomStyle = {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #dadce0',
    color: '#5f6368'
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={sectionStyle}>
            <h4 style={titleStyle}>Artha-Mantra</h4>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              AI-Driven Investment Simulator for Educational Excellence
            </p>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Features</h4>
            <ul style={listStyle}>
              <li style={listItemStyle}>Virtual Trading</li>
              <li style={listItemStyle}>AI Analytics</li>
              <li style={listItemStyle}>Portfolio Management</li>
              <li style={listItemStyle}>Real-time Data</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Company</h4>
            <ul style={listStyle}>
              <li>
                <Link to="/about" style={linkStyle}>About Us</Link>
              </li>
              <li>
                <Link to="/contact" style={linkStyle}>Contact</Link>
              </li>
              <li>
                <Link to="/privacy-policy" style={linkStyle}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" style={linkStyle}>Terms of Service</Link>
              </li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Team</h4>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              <b>Developed by</b> <br />
              Gunwant Patil <br />
              Devesh Patil <br />
              Gitesh Patil <br />
              Suyash Kutwal <br />
              <b>Guided by </b>Prof. P. N. Railkar
            </p>
          </div>
        </div>

        <div style={bottomStyle}>
          <p>&copy; Artha-Mantra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
