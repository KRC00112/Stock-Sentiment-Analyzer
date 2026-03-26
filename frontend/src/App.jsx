import { useEffect, useState } from 'react'
import './App.css'
import DonutChart from "react-donut-chart";

function App() {

    const sampleTickers=['AMZN','MSFT','AAPL','GOOGL','NVDA','META']

    const [apiDataObj, setApiDataObj] = useState({})
    const [tickerNameInput, setTickerNameInput] = useState('')
    const [tickerName, setTickerName] = useState('')
    const [pageSizeInput, setPageSizeInput] = useState(10)
    const [pageSize, setPageSize] = useState(10)
    const [activeSampleTicker, setActiveSampleTicker] = useState('')


    useEffect(() => {
        if (!tickerName) return  // guard on tickerName, not tickerNameInput

        async function getData() {
            const response = await fetch(
                `http://127.0.0.1:8000/sentiment/${tickerName}?total_page_size=${pageSize}`
            )
            const data = await response.json()
            setApiDataObj(data)
        }
        getData()
    }, [tickerName, pageSize])

    const handleTickerInputChange = (e) => {
        setTickerNameInput(e.target.value)
    }

    const handlePageSizeInputChange = (e) => {
        setPageSizeInput(e.target.value)
    }

    const handleBtnClick = () => {
        if (!tickerNameInput) return
        setTickerName(tickerNameInput.toUpperCase())
        setPageSize(pageSizeInput?Number(pageSizeInput):10)
        setTickerNameInput('')
    }

    return (
        <div className='app'>
            <div className='main-panel'>
                <input type='text' onChange={handleTickerInputChange} value={tickerNameInput} />
                <input type='number' onChange={handlePageSizeInputChange} value={pageSizeInput} />
                <button onClick={handleBtnClick}>Get Data</button>
                <div>{sampleTickers.map(ticker=>{
                    return <button key={ticker}
                                   onClick={()=>{setActiveSampleTicker(ticker);setTickerName(ticker.toUpperCase())}}
                                    className={`${activeSampleTicker===ticker?'orange':''}`}>{ticker}</button>
                })}
                </div>
                <div className='ticker-and-signal'>
                    <div className='ticker-and-company'>
                        <div>{apiDataObj.ticker}</div>
                        <div>{apiDataObj.company}</div>
                    </div>
                    <div className='signal'>
                        <div>SIGNAL</div>
                        <div>{apiDataObj.signal}</div>
                    </div>
                </div>
                <div className='analysis-and-distribution'>
                    <div className='sentiment-analysis'>
                        <div className='articles-analyzed'>
                            <div>Articles analyzed</div>
                            <div>{apiDataObj?.summary?.total_articles}</div>
                            <div>last batch</div>
                        </div>

                        <div className='negative-coverage'>
                            <div>Negative coverage</div>
                            <div>{apiDataObj.summary?.negative_pct}%</div>
                            <div>{apiDataObj.summary?.negative} articles</div>
                        </div>

                        <div className='positive-coverage'>
                            <div>Positive coverage</div>
                            <div>{apiDataObj.summary?.positive_pct}%</div>
                            <div>{apiDataObj.summary?.positive} articles</div>
                        </div>

                        <div className='neutral-coverage'>
                            <div>Neutral coverage</div>
                            <div>{apiDataObj.summary?.neutral_pct}%</div>
                            <div>{apiDataObj.summary?.neutral} articles</div>
                        </div>
                    </div>
                    <div><DonutChart
                        className="donutchart"
                        innerRadius={0.6}
                        outerRadius={0.9}
                        legend={false}
                        width={260}
                        height={260}
                        colors={["#4CAF50", "#2196F3", "#FF5722"]}
                        data={[{label:'positive', value:apiDataObj.summary?.positive_pct},
                                {label:'negative', value:apiDataObj.summary?.negative_pct},
                                {label:'neutral', value:apiDataObj.summary?.neutral_pct}].map(b => ({
                            label: b.label,
                            value: b.value
                        }))}
                        style={{ color: "white" }}
                    /></div>

                </div>
                <div className='articles-list'>{apiDataObj?.articles?.map(obj=>{
                    return <div className='article-card' key={obj.id}>
                        <div>{obj.id}.</div>
                        <div>{obj.title}</div>
                        <div>
                            <div>{obj.sentiment_label}</div>
                            <div>{obj.confidence_score_pct}</div>
                        </div>

                    </div>
                })}</div>
            </div>

        </div>
    )
}

export default App