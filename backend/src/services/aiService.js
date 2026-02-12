const axios = require("axios");

const AI_SERVICE_URL = "http://localhost:8000";

async function analyzeTrade(tradeData) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-trade`, tradeData);
    return response.data;
  } catch (error) {
    console.error("AI Trade Service Error:", error.message);
    return {
      profit: tradeData.exit_price - tradeData.entry_price,
      profit_percentage: 0,
      analysis: "AI analysis unavailable."
    };
  }
}

async function generateMonthlyReport(metrics) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/monthly-report`,
      metrics
    );
    return response.data;
  } catch (error) {
    console.error("Monthly Report AI Error:", error.message);
    return {
      report: "AI monthly personality report unavailable."
    };
  }
}


module.exports = { analyzeTrade, generateMonthlyReport };
