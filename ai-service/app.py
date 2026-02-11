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
    return {"message": "Artha-Mantra AI Service Running (Optimized Mode)"}


@app.post("/analyze-trade")
def analyze_trade(data: TradeData):

    profit = (data.exit_price - data.entry_price) * data.quantity
    profit_percentage = ((data.exit_price - data.entry_price) / data.entry_price) * 100

    # 🚀 Optimized Prompt (Shorter, Structured, No Essay)
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
- Bullet points (if anything good happened)

What Went Wrong:
- Bullet points (simple language)

Risk Check:
- Did you manage risk properly?
- Was position size reasonable?

What You Should Learn:
- 3 clear beginner-friendly lessons

Final Grade:
- Grade (A-F)
- 2 line explanation why

Rules:
- Use very simple language.
- Avoid complex technical terms.
- Keep it educational.
- Do not write long paragraphs.
- Maximum 400-500 words.
"""


    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": "You are a strict professional trading mentor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,   # 🔥 Increased limit
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
