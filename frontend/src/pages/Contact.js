import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', lineHeight: '1.6' }}>
            Have questions about Artha-Mantra? We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
            
            {/* Contact Info */}
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#202124' }}>Get in Touch</h2>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1a73e8' }}>📧 Email</h3>
                <p style={{ color: '#5f6368', fontSize: '1rem' }}>info@artha-mantra.com</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1a73e8' }}>🏫 College</h3>
                <p style={{ color: '#5f6368', fontSize: '1rem' }}>
                  Keystone School of Engineering<br/>
                  Computer Engineering Department<br/>
                  Pune, Maharashtra, India
                </p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1a73e8' }}>👨‍🏫 Guide</h3>
                <p style={{ color: '#5f6368', fontSize: '1rem' }}>Prof. K. A. Vatekar</p>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#202124' }}>Send us a Message</h3>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1557b0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1a73e8'}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
