from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = FastAPI()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ======================================================
# 🔹 AI CALL FUNCTION (OPENROUTER FREE)
# ======================================================

def call_ai(prompt):
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",   # 🔥 REQUIRED
                "X-Title": "Artha-Mantra"                  # 🔥 REQUIRED
            },
            json={
                "model": "openrouter/free",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4
            }
        )

        data = response.json()

        # 🔍 DEBUG PRINT (IMPORTANT)
        print("AI RAW RESPONSE:", data)

        # ✅ SAFE HANDLING
        if "choices" in data:
            return data["choices"][0]["message"]["content"]
        elif "error" in data:
            return f"AI Error: {data['error']['message']}"
        else:
            return "AI returned unexpected response"

    except Exception as e:
        print("AI ERROR:", e)
        return f"AI service unavailable: {str(e)}"

# ======================================================
# 🔹 TRADE ANALYSIS MODEL
# ======================================================

class TradeData(BaseModel):
    stock: str
    entry_price: float
    exit_price: float
    quantity: int
    rsi: Optional[float] = None
    macd: Optional[float] = None
    volume: Optional[float] = None
    sentiment: Optional[str] = None


@app.get("/")
def root():
    return {"message": "Artha-Mantra AI Service Running (OpenRouter Mode)"}


# ======================================================
# 🔹 TRADE ANALYSIS ENDPOINT
# ======================================================

@app.post("/analyze-trade")
def analyze_trade(data: TradeData):

    profit = (data.exit_price - data.entry_price) * data.quantity

    if data.entry_price and data.entry_price != 0:
        profit_percentage = ((data.exit_price - data.entry_price) / data.entry_price) * 100
    else:
        profit_percentage = 0

    prompt = f"""
You are a beginner-friendly trading mentor.

Analyze this completed trade and explain it in simple language.

Trade Details:
Stock: {data.stock}
Entry Price: {data.entry_price}
Exit Price: {data.exit_price}
Quantity: {data.quantity}
Profit/Loss: {profit}
Return %: {profit_percentage:.2f}%
RSI: {data.rsi}
MACD: {data.macd}
Volume: {data.volume}
Sentiment: {data.sentiment}

Respond in this exact structure:

Trade Summary:
- Was this trade profitable or loss?
- Short explanation (2–3 lines max)

What Went Right:
- Bullet points

What Went Wrong:
- Bullet points

Risk Check:
- Was risk managed properly?

What You Should Learn:
- 3 beginner-friendly lessons

Final Grade:
- Grade (A-F)
- Short explanation

Keep it simple. Avoid long paragraphs.
"""

    analysis_text = call_ai(prompt)

    return {
        "profit": profit,
        "profit_percentage": profit_percentage,
        "analysis": analysis_text
    }


# ======================================================
# 🔹 MONTHLY REPORT MODEL
# ======================================================

class MonthlyReportRequest(BaseModel):
    totalTrades: int
    winRate: float
    biggestWin: float
    biggestLoss: float
    avgProfit: float


# ======================================================
# 🔹 MONTHLY PERSONALITY REPORT ENDPOINT
# ======================================================

@app.post("/monthly-report")
def generate_monthly_report(data: MonthlyReportRequest):

    prompt = f"""
You are an expert trading psychology mentor.

Analyze this trader’s monthly performance deeply but explain in very simple beginner-friendly language.

Trader Data:
- Total Trades: {data.totalTrades}
- Win Rate: {data.winRate}%
- Biggest Win: {data.biggestWin}
- Biggest Loss: {data.biggestLoss}
- Average Profit: {data.avgProfit}

Generate a detailed structured report:

1. Trader Personality Type  
- Give a clear label (e.g., Risky Beginner, Disciplined Trader, Overtrader, etc.)  
- Explain WHY in 2–3 lines

2. Strengths  
- 3 to 5 bullet points  
- Each point should have 1 line explanation

3. Weaknesses  
- 3 to 5 bullet points  
- Explain what exactly is going wrong

4. Risk Behaviour  
- Mention: Low / Medium / High  
- Explain reasoning in 2–3 lines

5. Emotional Discipline Score (1–10)  
- Give score  
- Explain WHY this score in 2–3 lines

6. Improvement Strategy  
- Give 1 clear actionable plan  
- Step-by-step (3–5 steps)

IMPORTANT:
- Keep language simple (like explaining to a beginner)
- DO NOT be too short
- DO NOT use complex jargon
- Keep it readable and structured
"""
    report_text = call_ai(prompt)

    return {
        "report": report_text
    }