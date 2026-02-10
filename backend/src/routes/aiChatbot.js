const express = require('express');
const { auth } = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI (add your API key to .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env file
});

// System prompt for trading AI
const TRADING_AI_PROMPT = `You are an expert trading and investment AI assistant for a demo trading platform called Artha-Mantra. Your role is to educate users about trading, stocks, and financial markets.

Guidelines:
- Provide detailed, educational responses about trading concepts
- Explain complex topics in simple terms for beginners
- Give practical examples when possible
- Always emphasize risk management and education
- Never provide specific stock recommendations or financial advice
- Focus on teaching trading principles, technical analysis, fundamental analysis
- Be conversational and helpful
- If unsure about something, acknowledge it and provide general guidance

Topics you can help with:
- Stock market basics
- Trading strategies and techniques
- Technical analysis (RSI, MACD, moving averages, etc.)
- Fundamental analysis (P/E ratios, financial statements)
- Risk management and portfolio diversification
- Market psychology and sentiment
- Order types and execution
- Economic indicators and their impact
- Chart patterns and price action
- Options, bonds, and other securities
- Investment principles and wealth building

Always end responses with an offer to help with follow-up questions.`;

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: TRADING_AI_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        id: Date.now(),
        message: aiResponse,
        timestamp: new Date().toISOString(),
        confidence: 'high',
        source: 'openai'
      }
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    
    // Fallback to local AI if OpenAI fails
    const fallbackResponse = generateLocalResponse(req.body.message);
    
    res.json({
      success: true,
      data: {
        id: Date.now(),
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        confidence: 'medium',
        source: 'fallback'
      }
    });
  }
});

// Enhanced local fallback system
function generateLocalResponse(question) {
  const lowerQ = question.toLowerCase();
  
  // Enhanced pattern matching with descriptive responses
  if (contains(lowerQ, ['technical analysis', 'chart', 'indicator', 'rsi', 'macd'])) {
    return `Technical analysis involves studying price charts and indicators to predict future price movements. Key indicators include:

• RSI (Relative Strength Index): Measures if a stock is overbought (>70) or oversold (<30)
• MACD: Shows the relationship between two moving averages, great for trend changes
• Moving Averages: Smooth out price data to identify trends
• Support/Resistance: Price levels where stocks tend to bounce

Charts help traders identify patterns like triangles, head and shoulders, and breakouts. Would you like me to explain any specific indicator in detail?`;
  }

  if (contains(lowerQ, ['fundamental analysis', 'p/e', 'earnings', 'financial'])) {
    return `Fundamental analysis evaluates a company's intrinsic value by examining financial data:

• P/E Ratio: Price-to-earnings ratio shows how much investors pay per dollar of earnings
• Revenue Growth: Indicates if the company is expanding
• Profit Margins: Shows how efficiently a company converts sales to profits
• Debt-to-Equity: Measures financial leverage and risk
• ROE (Return on Equity): Shows how well management uses shareholder money

Key documents to review: Income Statement, Balance Sheet, and Cash Flow Statement. Strong fundamentals often lead to long-term price appreciation. What specific financial metric would you like to understand better?`;
  }

  if (contains(lowerQ, ['risk', 'management', 'loss', 'protect'])) {
    return `Risk management is crucial for successful trading. Here are key strategies:

• Position Sizing: Never risk more than 1-2% of your capital on a single trade
• Diversification: Spread investments across different sectors and asset classes
• Stop-Loss Orders: Automatically sell if price drops to a predetermined level
• Asset Allocation: Balance between stocks, bonds, and cash based on your risk tolerance
• Emotional Control: Stick to your plan, don't let fear or greed drive decisions

Remember: "Cut your losses short and let your profits run." The goal isn't to be right all the time, but to make more on winning trades than you lose on losing ones. How do you currently manage risk in your trading?`;
  }

  if (contains(lowerQ, ['start', 'begin', 'new', 'novice', 'learn'])) {
    return `Great that you're starting your trading journey! Here's a structured approach:

📚 Step 1 - Education:
• Learn market basics: stocks, bonds, ETFs
• Understand key concepts: supply/demand, volatility, liquidity
• Study both fundamental and technical analysis

🎯 Step 2 - Practice:
• Use demo platforms like this one to practice risk-free
• Paper trade different strategies
• Keep a trading journal to track decisions

💰 Step 3 - Start Small:
• Begin with money you can afford to lose
• Focus on blue-chip stocks initially
• Gradually increase complexity as you gain experience

📊 Step 4 - Develop Your Style:
• Day trading, swing trading, or long-term investing
• Find what matches your personality and schedule

What specific aspect of trading interests you most? I can provide more detailed guidance!`;
  }

  if (contains(lowerQ, ['strategy', 'approach', 'method', 'technique'])) {
    return `There are several trading strategies, each with different risk/reward profiles:

🔄 Day Trading:
• Buy and sell within the same day
• Requires significant time and capital
• Higher risk but potential for quick profits

📈 Swing Trading:
• Hold positions for days to weeks
• Capture medium-term price movements
• Good balance of risk and time commitment

💼 Position Trading:
• Long-term approach (months to years)
• Based on fundamental analysis
• Lower stress, requires patience

🎯 Momentum Trading:
• Follow strong price trends
• Use technical indicators for entry/exit
• Ride the wave of market sentiment

The key is finding a strategy that matches your risk tolerance, time availability, and personality. Which timeframe appeals to you most?`;
  }

  if (contains(lowerQ, ['market', 'economy', 'bull', 'bear', 'crash'])) {
    return `Understanding market conditions is essential for trading success:

🐂 Bull Markets (Rising):
• Characterized by optimism and rising prices
• Good time for buying and holding
• Most stocks tend to rise together

🐻 Bear Markets (Falling):
• 20%+ decline from recent highs
• Pessimism and fear dominate
• Opportunities for short selling or cash preservation

📊 Market Cycles:
• Markets move in cycles influenced by economics, politics, and psychology
• Economic indicators: GDP, inflation, employment, interest rates
• Central bank policies significantly impact markets

💭 Market Psychology:
• Fear and greed drive most market movements
• Contrarian investing: buy when others are fearful
• Market sentiment indicators can signal reversals

Current market conditions affect strategy choice. In bull markets, momentum strategies work well. In bear markets, defensive strategies and cash preservation become important. What current market trends concern you?`;
  }

  // Dynamic response for any other question
  const topics = extractTradingTopics(lowerQ);
  if (topics.length > 0) {
    return `I can help you understand ${topics.join(', ')}! 

These are important trading concepts that can significantly impact your success in the markets. Each topic has multiple layers of complexity, from basic understanding to advanced application strategies.

For ${topics[0]}, here are some key points to consider:
• Understanding the fundamentals is crucial before applying advanced techniques
• Real-world application often differs from textbook theory
• Risk management should always be your primary concern
• Practice with demo trading before using real money

Would you like me to dive deeper into any specific aspect of ${topics[0]}? I can explain the basics, show you how to apply it practically, or discuss common mistakes traders make with this concept.

I'm here to help you build a solid foundation in trading knowledge!`;
  }

  // Ultimate fallback with specific guidance
  return `I'm here to help with any trading question you have! I can provide detailed explanations on:

💹 **Trading Fundamentals**: Market mechanics, order types, bid/ask spreads
📊 **Technical Analysis**: Chart patterns, indicators, price action
💰 **Fundamental Analysis**: Financial statements, valuation methods
⚖️ **Risk Management**: Position sizing, stop losses, diversification
📈 **Strategies**: Day trading, swing trading, value investing
🧠 **Psychology**: Emotional control, cognitive biases
🌍 **Market Conditions**: Economic indicators, sector analysis
💡 **Beginner Topics**: Getting started, account setup, basic concepts

Your question: "${question}"

Could you be more specific about what aspect you'd like to explore? For example:
- Are you looking for a basic explanation or advanced strategies?
- Do you want practical examples or theoretical understanding?
- Are you interested in a particular market or asset class?

I'm ready to provide a detailed, educational response tailored to your needs!`;
}

// Helper function for keyword matching
function contains(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

// Extract trading-related topics from question
function extractTradingTopics(question) {
  const tradingTerms = [
    'stocks', 'bonds', 'options', 'futures', 'etfs', 'mutual funds',
    'dividends', 'earnings', 'revenue', 'profit', 'loss',
    'volatility', 'liquidity', 'volume', 'market cap',
    'bull market', 'bear market', 'correction', 'crash',
    'support', 'resistance', 'trend', 'breakout',
    'momentum', 'value investing', 'growth investing',
    'diversification', 'allocation', 'rebalancing',
    'inflation', 'interest rates', 'fed', 'gdp'
  ];

  return tradingTerms.filter(term => question.includes(term));
}

module.exports = router;
