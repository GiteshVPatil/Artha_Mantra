import React from 'react';

const TermsOfService = () => {
  return (
    <div className="terms-of-service-page">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', lineHeight: '1.6' }}>
            Terms and conditions for using the Artha-Mantra platform
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Acceptance of Terms</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              By accessing and using Artha-Mantra, you accept and agree to be bound by the terms and 
              provision of this agreement. This is an educational platform developed as a final year 
              project by Computer Engineering students at SKNCOE.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Educational Purpose Only</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6', marginBottom: '15px' }}>
              Artha-Mantra is designed exclusively for educational purposes:
            </p>
            <ul style={{ color: '#5f6368', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>No real money or actual trading is involved</li>
              <li>All transactions use virtual currency</li>
              <li>Market data is for learning purposes only</li>
              <li>Investment recommendations are AI-generated for educational simulation</li>
            </ul>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>User Responsibilities</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6', marginBottom: '15px' }}>
              As a user of Artha-Mantra, you agree to:
            </p>
            <ul style={{ color: '#5f6368', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Use the platform for educational purposes only</li>
              <li>Provide accurate information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not attempt to exploit or damage the platform</li>
              <li>Respect other users and maintain appropriate conduct</li>
            </ul>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Disclaimer</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              This platform is provided "as is" for educational purposes. The developers and SKNCOE 
              are not responsible for any decisions made based on the simulated trading experience. 
              Real investment decisions should always be made with proper financial advice and research.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Intellectual Property</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              Artha-Mantra is a final year project developed by students of SKNCOE under the guidance 
              of Prof. K. A. Vatekar. All rights to the platform design, code, and educational content 
              are reserved.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Contact Information</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              For any questions regarding these terms, please contact us at info@artha-mantra.com
            </p>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#5f6368', fontSize: '0.9rem', margin: '0' }}>
              Last updated: October 2025 | BE Project 2025-26 | SKNCOE
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
