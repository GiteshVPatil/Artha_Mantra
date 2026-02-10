import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI trading assistant powered by advanced AI. I can help you with any trading questions - from basic concepts to advanced strategies. What would you like to learn about?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { token, isAuthenticated } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !isAuthenticated) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for OpenAI context
      const conversationHistory = messages
        .slice(-10) // Keep last 10 messages
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        }));

      const response = await axios.post(`${API_BASE}/ai-chatbot/chat`, {
        message: currentInput,
        conversationHistory: conversationHistory,
        conversationId: 'trading-session'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.data.message,
          isBot: true,
          timestamp: new Date(),
          confidence: response.data.data.confidence,
          source: response.data.data.source
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or check your connection.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What is technical analysis?",
    "How do I manage trading risk?",
    "Explain RSI and MACD indicators",
    "What's the difference between day trading and swing trading?",
    "How to analyze a company's financials?"
  ];

  // Don't show chatbot if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const chatbotStyles = {
    chatbotContainer: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    },
    toggleButton: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#1a73e8',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(26, 115, 232, 0.4)',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    chatWindow: {
      position: 'absolute',
      bottom: '70px',
      right: '0',
      width: '380px',
      height: '550px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: '#1a73e8',
      color: 'white',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    messagesContainer: {
      flex: 1,
      padding: '16px',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa'
    },
    message: {
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'flex-start'
    },
    userMessage: {
      justifyContent: 'flex-end'
    },
    messageBubble: {
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '18px',
      fontSize: '14px',
      lineHeight: '1.4',
      wordWrap: 'break-word'
    },
    botBubble: {
      backgroundColor: 'white',
      color: '#202124',
      borderBottomLeftRadius: '6px',
      border: '1px solid #e1e3e4'
    },
    userBubble: {
      backgroundColor: '#1a73e8',
      color: 'white',
      borderBottomRightRadius: '6px'
    },
    inputContainer: {
      padding: '16px',
      borderTop: '1px solid #e1e3e4',
      backgroundColor: 'white'
    },
    inputWrapper: {
      display: 'flex',
      gap: '8px'
    },
    input: {
      flex: 1,
      padding: '12px',
      border: '1px solid #dadce0',
      borderRadius: '20px',
      fontSize: '14px',
      outline: 'none'
    },
    sendButton: {
      padding: '8px 16px',
      backgroundColor: '#1a73e8',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '60px'
    },
    quickQuestions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '12px'
    },
    quickQuestion: {
      padding: '6px 12px',
      backgroundColor: '#e8f0fe',
      color: '#1a73e8',
      border: '1px solid #1a73e8',
      borderRadius: '16px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#1a73e8',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      marginRight: '8px',
      flexShrink: 0
    },
    timestamp: {
      fontSize: '10px',
      color: '#5f6368',
      marginTop: '4px'
    },
    badge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#34a853',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={chatbotStyles.chatbotContainer}>
      {isOpen && (
        <div style={chatbotStyles.chatWindow}>
          <div style={chatbotStyles.header}>
            <span>🤖 AI Trading Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={chatbotStyles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  ...chatbotStyles.message,
                  ...(message.isBot ? {} : chatbotStyles.userMessage)
                }}
              >
                {message.isBot && (
                  <div style={chatbotStyles.avatar}>🤖</div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      ...chatbotStyles.messageBubble,
                      ...(message.isBot ? chatbotStyles.botBubble : chatbotStyles.userBubble),
                      backgroundColor: message.isError ? '#fef2f2' : 
                        message.isBot ? 'white' : '#1a73e8'
                    }}
                  >
                    {message.text}
                  </div>
                  <div style={chatbotStyles.timestamp}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.source && ` • ${message.source}`}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={chatbotStyles.message}>
                <div style={chatbotStyles.avatar}>🤖</div>
                <div style={{...chatbotStyles.messageBubble, ...chatbotStyles.botBubble}}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div>Thinking</div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <span style={{ animation: 'blink 1.4s infinite' }}>.</span>
                      <span style={{ animation: 'blink 1.4s infinite 0.2s' }}>.</span>
                      <span style={{ animation: 'blink 1.4s infinite 0.4s' }}>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div style={chatbotStyles.inputContainer}>
            {messages.length <= 2 && (
              <div style={chatbotStyles.quickQuestions}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    style={chatbotStyles.quickQuestion}
                    onClick={() => {
                      setInputMessage(question);
                      setTimeout(handleSendMessage, 100);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#1a73e8';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#e8f0fe';
                      e.target.style.color = '#1a73e8';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            
            <div style={chatbotStyles.inputWrapper}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about trading..."
                style={chatbotStyles.input}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                style={{
                  ...chatbotStyles.sendButton,
                  opacity: loading || !inputMessage.trim() ? 0.5 : 1,
                  cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        style={chatbotStyles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isOpen ? '×' : '🤖'}
        <div style={chatbotStyles.badge}>AI</div>
      </button>
      
      <style>
        {`
          @keyframes blink {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default AIChatbot;
