import os
from dotenv import load_dotenv
from newsapi import NewsApiClient
from transformers import pipeline
from fastapi import FastAPI
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware



app=FastAPI()

origins=["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

load_dotenv()
newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))
nlp = pipeline("text-classification", model="ProsusAI/finbert")

class TickerName(str, Enum):
    AAPL = "AAPL"
    MSFT = "MSFT"
    GOOGL = "GOOGL"
    NVDA = "NVDA"
    TSLA = "TSLA"
    AMZN = "AMZN"
    NFLX = "NFLX"
    META = "META"


companies = {
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "GOOGL": "Google",
    "NVDA": "Nvidia",
    "TSLA": "Tesla",
    "AMZN": "Amazon",
    "NFLX": "Netflix",
    "META": "Meta"
}



# for i,article in enumerate(top_articles['articles'],1):
#     print(i,". ",article['title'])




def summary(results):

    total_articles=len(results)

    def find_pct(type):
        val=(type/total_articles)*100
        return round(val,2)

    pos_count=0
    neg_count=0
    neu_count=0

    for article in results:
        if article['sentiment_label']=="positive":
            pos_count+=1
        elif article['sentiment_label']=="negative":
            neg_count+=1
        else:
            neu_count+=1


    return({
        "total_articles":total_articles,
        "positive":pos_count,
        "negative":neg_count,
        "neutral":neu_count,
        "positive_pct":find_pct(pos_count),
        "negative_pct":find_pct(neg_count),
        "neutral_pct":find_pct(neu_count),

    })


def determine_signal(summary_results):
    if summary_results['positive_pct'] > summary_results['negative_pct']+10:
        return "Bullish"
    elif summary_results['negative_pct'] > summary_results['positive_pct']+10:
        return "Bearish"
    else:
        return "Neutral"

@app.get("/sentiment/{ticker_name}")
async def display_result(ticker_name:TickerName, total_page_size:int = 10):

    top_articles = newsapi.get_everything(
        q=f'"{companies[ticker_name.value]}" OR "{ticker_name.value}"',
        language='en',
        sort_by='publishedAt',
        page_size=total_page_size,
        domains='reuters.com,bloomberg.com,cnbc.com,forbes.com,wsj.com,marketwatch.com,ft.com'

    )

    def formatted_score(obj):
        obj['score']=round(obj['score']*100,2)
        return obj

    results=[]
    for i, article in enumerate(top_articles['articles'],1):
        # print(i,". ",article['title'],"\n", formatted_score(nlp(article['title'])[0]))
        # results.append(f"{i}. {article['title']}, {formatted_score(nlp(article['title'])[0])}")
        sentiment = formatted_score(nlp(article['title'])[0])
        results.append({
            "id":i,
            "title":article['title'],
            "sentiment_label": sentiment['label'],
            "confidence_score_pct": sentiment['score']
        })

    summary_results=summary(results)

    return {
        "ticker":ticker_name.value,
        "company":companies[ticker_name.value],
        "signal":determine_signal(summary_results),
        "summary":summary_results,
        "articles":results
    }
