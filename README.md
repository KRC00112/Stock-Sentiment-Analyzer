# 📈 Stock Sentiment Analyzer

A full-stack application that analyzes financial news sentiment for any US-listed stock ticker using NLP. Enter a ticker symbol, and the app fetches recent news from top financial outlets, runs it through a FinBERT model, and returns a **Bullish / Bearish / Neutral** signal with article-level breakdowns.

---

## How It Works

1. A ticker symbol is passed to the FastAPI backend
2. The backend queries **NewsAPI** for recent articles from Reuters, Bloomberg, CNBC, Forbes, WSJ, MarketWatch, and the FT
3. Each article's description (or title) is classified using **[ProsusAI/FinBERT](https://huggingface.co/ProsusAI/finbert)**; a BERT model fine-tuned on financial text
4. Results are aggregated into a sentiment summary and a directional signal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Nginx |
| Backend | FastAPI |
| NLP Model | ProsusAI/FinBERT (🤗Hugging Face) via transformers|
| Market Data | Finnhub API |
| News Data | NewsAPI |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
.
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---


## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- A [NewsAPI](https://newsapi.org/) API key
- A [Finnhub](https://finnhub.io/) API key

## Steps For Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stock-sentiment-analyzer.git
cd stock-sentiment-analyzer
```

### 2. Set up environment variables

Create a `.env` file inside the `backend/` directory:

```env
NEWS_API_KEY=your_newsapi_key_here
FINNHUB_API_KEY=your_finnhub_key_here
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## 🔌 API Reference

### `GET /sentiment/{ticker_name}`

Returns sentiment analysis for a given stock ticker.

**Path parameter:** `ticker_name`; any valid US stock ticker (e.g. `AAPL`, `TSLA`, `MSFT`)

**Query parameter:** `total_page_size` *(optional, default: 10)*; number of articles to analyze

**Example request:**
```
GET /sentiment/AAPL?total_page_size=15
```

**Example response:**
```json
{
  "ticker": "AAPL",
  "company": "APPLE INC",
  "signal": "Bullish",
  "summary": {
    "total_articles": 15,
    "positive": 9,
    "negative": 3,
    "neutral": 3,
    "positive_pct": 60.0,
    "negative_pct": 20.0,
    "neutral_pct": 20.0
  },
  "articles": [
    {
      "id": 1,
      "title": "Apple beats earnings expectations...",
      "desc": "Apple reported quarterly earnings...",
      "sentiment_label": "positive",
      "confidence_score_pct": 94.32
    }
  ]
}
```

### Signal Logic

| Condition | Signal |
|---|---|
| `positive_pct > negative_pct + 10` | 🟢 Bullish |
| `negative_pct > positive_pct + 10` | 🔴 Bearish |
| Otherwise | 🟡 Neutral |

---

## Docker Images

Pre-built images are available on Docker Hub:

```bash
# Backend
docker pull krcdocker2138/stock-sentiment-analyzer:backend-v16

# Frontend
docker pull krcdocker2138/stock-sentiment-analyzer:frontend-v16
```

---

## ⚠️ Disclaimer

This tool is for **informational and educational purposes only**. It is not financial advice. Sentiment derived from news headlines does not guarantee future stock performance. Always do your own research before making investment decisions.
