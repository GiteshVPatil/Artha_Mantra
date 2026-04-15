import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Guidelines = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem("guidelinesAccepted", "true");
    navigate("/dashboard"); // or homepage
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>📘 Beginner Trading Guidelines</h1>

      {/* Intro */}
      <p style={{ fontSize: '15px', color: '#5f6368' }}>
        Welcome to Artha-Mantra. This platform is designed to help beginners learn trading.
        However, trading involves financial risk. Please read the guidelines carefully.
      </p>

      {/* Risk Warning */}
      <div style={{
        backgroundColor: '#fce8e6',
        border: '1px solid #f5c2c0',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '25px'
      }}>
        <h3>⚠️ Risk Warning</h3>
        <ul>
          <li>You can lose money in trading</li>
          <li>Past performance does not guarantee future results</li>
          <li>Do not invest borrowed money</li>
        </ul>
      </div>

      {/* Rules */}
      <div style={{ marginTop: '30px' }}>
        <h3>📊 Basic Trading Rules</h3>
        <ul>
          <li>Always use stop-loss</li>
          <li>Diversify your investments</li>
          <li>Start with small amounts</li>
          <li>Avoid emotional trading</li>
        </ul>
      </div>

      {/* Tips */}
      <div style={{ marginTop: '30px' }}>
        <h3>🧠 Beginner Tips</h3>
        <ul>
          <li>Learn before investing</li>
          <li>Track your trades</li>
          <li>Analyze your mistakes</li>
          <li>Be patient and disciplined</li>
        </ul>
      </div>

      {/* AI Info */}
      <div style={{ marginTop: '30px' }}>
        <h3>🤖 How AI Helps You</h3>
        <p>
          Our AI analyzes your trades and gives insights like:
          strengths, weaknesses, and improvement strategies to help you grow.
        </p>
      </div>

      {/* Agreement */}
      <div style={{ marginTop: '40px' }}>
        <label>
          <input
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />
          <span style={{ marginLeft: '10px' }}>
            I understand the risks and want to continue
          </span>
        </label>
      </div>

      <button
        disabled={!accepted}
        onClick={handleContinue}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: accepted ? '#1a73e8' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: accepted ? 'pointer' : 'not-allowed'
        }}
      >
        Continue to Dashboard →
      </button>
    </div>
  );
};

export default Guidelines;