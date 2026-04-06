const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;

    const rangeMap = {
      "1D": "5d",
      "1W": "1mo",
      "1M": "1mo",
      "3M": "3mo",
      "6M": "6mo",
      "1Y": "1y"
    };

    const range = rangeMap[timeframe] || "1mo";

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?range=${range}&interval=1d`;

    const response = await axios.get(url);

    if (!response.data.chart || !response.data.chart.result) {
      return res.status(400).json({ success: false, message: "No data found" });
    }

    const result = response.data.chart.result[0];

    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;

    if (!timestamps || !prices) {
      return res.status(400).json({ success: false, message: "No data found" });
    }

    const formatted = timestamps.map((time, index) => ({
      date: new Date(time * 1000).toLocaleDateString(),
      price: prices[index]
    }));

    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("Yahoo history error:", error.message);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
