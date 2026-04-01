import os
import re
import finnhub
from dotenv import load_dotenv
from newsapi import NewsApiClient
from transformers import pipeline
from fastapi import FastAPI
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware



app=FastAPI()

origins=["*"]

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


finnhub_client = finnhub.Client(api_key=os.getenv("FINNHUB_API_KEY"))
all_stocks=finnhub_client.stock_symbols('US')
companies={}
for stock in all_stocks:
  companies[stock['symbol']]=stock['description']

TickerName = Enum('TickerName',{symbol: symbol for symbol in companies.keys()})



# for i,article in enumerate(top_articles['articles'],1):
#     print(i,". ",article['title'])




def summary(results):

    total_articles=len(results)

    if total_articles == 0:
                return {
                    "total_articles": 0,
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0,
                    "positive_pct": 0,
                    "negative_pct": 0,
                    "neutral_pct": 0,
                }
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

STRIP_SUFFIXES = r'\b(INC|CORP|LTD|LLC|CO|PLC|GROUP|HOLDINGS?|INTERNATIONAL|INTL|NV|SA|AG|SE|/THE|.COM|-|CL|A|PLC)\b\.?'

def clean_company_name(raw: str):
    cleaned = re.sub(STRIP_SUFFIXES, '', raw, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned.title()


@app.get("/sentiment/{ticker_name}")
async def display_result(ticker_name:TickerName, total_page_size:int = 10):
    top_articles = newsapi.get_everything(
        q=f'"{clean_company_name(companies[ticker_name.value])}" OR "{ticker_name.value}"',
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
