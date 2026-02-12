from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

HF_API_KEY = os.getenv("HF_API_KEY")

client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    token=HF_API_KEY
)

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
    return {"message": "Artha-Mantra AI Service Running (Stable Mode)"}


# ======================================================
# 🔹 TRADE ANALYSIS ENDPOINT
# ======================================================

@app.post("/analyze-trade")
def analyze_trade(data: TradeData):

    # Safe Profit Calculation
    profit = (data.exit_price - data.entry_price) * data.quantity

    # Safe Percentage Calculation
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

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": "You are a professional trading mentor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=900,
            temperature=0.3,
        )

        analysis_text = response.choices[0].message["content"]

    except Exception as e:
        analysis_text = f"AI service temporarily unavailable: {str(e)}"

    return {
        "profit": profit,
        "profit_percentage": profit_percentage,
        "analysis": analysis_text
    }


# ======================================================
# 🔹 MONTHLY REPORT MODEL (ONLY ONE — FIXED)
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
You are a trading psychology expert.

Analyze this trader's monthly performance:

Total Trades: {data.totalTrades}
Win Rate: {data.winRate}%
Biggest Win: {data.biggestWin}
Biggest Loss: {data.biggestLoss}
Average Profit: {data.avgProfit}

Generate a structured beginner-friendly report:

1. Trader Personality Type (1 line)
2. Strengths (bullet points)
3. Weaknesses (bullet points)
4. Risk Behaviour (Low/Medium/High + short reason)
5. Emotional Discipline Score (1-10)
6. One Clear Improvement Strategy

Keep it concise and simple.
"""

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": "You are a trading psychology mentor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=700,
            temperature=0.4,
        )

        report_text = response.choices[0].message["content"]

    except Exception as e:
        report_text = f"AI generation failed: {str(e)}"

    return {
        "report": report_text
    }
