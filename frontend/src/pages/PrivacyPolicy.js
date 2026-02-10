import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', lineHeight: '1.6' }}>
            How we protect and handle your personal information
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Information We Collect</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6', marginBottom: '15px' }}>
              Artha-Mantra collects information you provide directly to us, such as when you create an account, 
              use our trading simulator, or contact us for support.
            </p>
            <ul style={{ color: '#5f6368', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Account information (name, email address)</li>
              <li>Trading simulation data and portfolio information</li>
              <li>Usage data and platform interactions</li>
              <li>Communications with our support team</li>
            </ul>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>How We Use Your Information</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6', marginBottom: '15px' }}>
              We use the information we collect to:
            </p>
            <ul style={{ color: '#5f6368', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Provide and maintain our educational trading platform</li>
              <li>Personalize your learning experience</li>
              <li>Analyze platform usage to improve our services</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Data Security</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. All passwords are encrypted 
              using industry-standard hashing algorithms.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Educational Purpose</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              Artha-Mantra is an educational platform designed for learning purposes only. No real money 
              or actual trading is involved. All trading simulations use virtual currency.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#202124' }}>Contact Us</h2>
            <p style={{ color: '#5f6368', lineHeight: '1.6' }}>
              If you have any questions about this Privacy Policy, please contact us at info@artha-mantra.com
            </p>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#5f6368', fontSize: '0.9rem', margin: '0' }}>
              Last updated: October 2025
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
