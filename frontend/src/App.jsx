import { useEffect, useState } from 'react'
import './App.css'
import DonutChart from "react-donut-chart";

function App() {

    const sampleTickers = ['AMZN', 'MSFT', 'AAPL', 'GOOGL', 'NVDA', 'META']

    const signalStyleOnRender=(signal)=>{
        if(signal==='Bullish'){
            return 'bullish-signal-color'
        }else if(signal==='Bearish'){
            return 'bearish-signal-color'
        }
        return 'neutral-signal-color'
    }

    const signalOnRender=(signal)=>{
        if(signal==='Bullish'){
            return '▲ Bullish'
        }else if(signal==='Bearish'){
            return '▼ Bearish'
        }
        return '◆ Neutral'
    }


    const [apiDataObj, setApiDataObj] = useState({})
    const [tickerNameInput, setTickerNameInput] = useState('')
    const [tickerName, setTickerName] = useState('')
    const [pageSizeInput, setPageSizeInput] = useState(10)
    const [pageSize, setPageSize] = useState(10)
    const [activeSampleTicker, setActiveSampleTicker] = useState('')
    const [loading, setLoading] = useState(false)
    const [reload, setReload] = useState(0)
    const [error, setError] = useState(false)
    useEffect(() => {
        if (!tickerName) return

        async function getData() {
            setError(false)
            const response = await fetch(
                `http://127.0.0.1:8000/sentiment/${tickerName}?total_page_size=${pageSize}`
            )

            if(!response.ok){
                setError(true)
                setApiDataObj({})
                setLoading(false)
                return

            }

            const data = await response.json()
            setApiDataObj(data)
            setLoading(false)
        }
        getData()
    }, [tickerName, pageSize, reload])

    const handleTickerInputChange = (e) => setTickerNameInput(e.target.value)
    const handlePageSizeInputChange = (e) => setPageSizeInput(e.target.value)

    const handleGetBtnClick = () => {
        if (!tickerNameInput) return
        setTickerName(tickerNameInput.toUpperCase().trim())
        setPageSize(pageSizeInput ? Number(pageSizeInput) : 10)
        setTickerNameInput('')
        setActiveSampleTicker('')
        setLoading(true)
        setReload(prev => prev + 1)
    }

    const onSampleTickerClick = (ticker) => {
        setActiveSampleTicker(ticker)
        setTickerName(ticker.toUpperCase())
        setTickerNameInput(ticker)
        setPageSize(pageSizeInput ? Number(pageSizeInput) : 10)
        setLoading(true)
        setReload(prev => prev + 1)
    }

    const getSentimentClass = (label) => {
        if (!label) return ''
        const l = label.toLowerCase()
        if (l.includes('pos')) return 'positive'
        if (l.includes('neg')) return 'negative'
        return 'neutral'
    }

    return (
        <div className='app'>
            <div className='main-panel'>
                <header>STOCK SENTIMENT ANALYZER</header>

                {/* Search row */}
                <div className='search-row'>
                    <input
                        type='text'
                        placeholder='Enter ticker…'
                        onChange={handleTickerInputChange}
                        value={tickerNameInput}
                        disabled={loading}
                        onKeyDown={(e) => e.key === 'Enter' && handleGetBtnClick()}
                    />
                    <input
                        type='number'
                        onChange={handlePageSizeInputChange}
                        value={pageSizeInput}
                        disabled={loading}
                        min={1}
                    />
                    <button className='btn-get' onClick={handleGetBtnClick} disabled={loading}>
                        Analyze
                    </button>
                </div>

                {/* Quick-pick pills */}
                <div className='ticker-pills'>
                    {sampleTickers.map(ticker => (
                        <button
                            key={ticker}
                            disabled={loading}
                            onClick={() => onSampleTickerClick(ticker)}
                            className={activeSampleTicker === ticker ? 'orange' : ''}
                        >
                            {ticker}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className='loading'>
                        <span className='loading-dot' />
                        <span className='loading-dot' />
                        <span className='loading-dot' />
                        Fetching sentiment data…
                    </div>
                )}

                {error && !loading && (
                    <div>
                        Check Your ticker name or try again later.
                    </div>
                )}

                {apiDataObj.summary?.total_articles <= 0 && !loading && (
                    <div>
                        No articles for {tickerName} right now.
                    </div>
                )}

                {/* Results */}
                {apiDataObj.summary?.total_articles > 0 && !loading && (
                    <div className='results'>

                        {/* Header */}
                        <div className='ticker-and-signal'>
                            <div className='ticker-and-company'>
                                <div className='ticker-label'>{apiDataObj.ticker}</div>
                                <div className='company-label'>{apiDataObj.company}</div>
                            </div>
                            <div className='signal'>
                                <div className='signal-eyebrow'>Signal</div>
                                <div className={`signal-value ${signalStyleOnRender(apiDataObj.signal)}`}>{signalOnRender(apiDataObj.signal)}</div>
                            </div>
                        </div>

                        {/* Stats + Donut */}
                        <div className='analysis-and-distribution'>
                            <div className='sentiment-analysis'>

                                <div className='stat-card total'>
                                    <span className='stat-label'>Articles analyzed</span>
                                    <span className='stat-value'>{apiDataObj?.summary?.total_articles}</span>
                                    <span className='stat-sub'>last batch</span>
                                </div>

                                <div className='stat-card positive'>
                                    <span className='stat-label'>Positive</span>
                                    <span className='stat-value'>{apiDataObj.summary?.positive_pct}%</span>
                                    <span className='stat-sub'>{apiDataObj.summary?.positive} articles</span>
                                </div>

                                <div className='stat-card negative'>
                                    <span className='stat-label'>Negative</span>
                                    <span className='stat-value'>{apiDataObj.summary?.negative_pct}%</span>
                                    <span className='stat-sub'>{apiDataObj.summary?.negative} articles</span>
                                </div>

                                <div className='stat-card neutral'>
                                    <span className='stat-label'>Neutral</span>
                                    <span className='stat-value'>{apiDataObj.summary?.neutral_pct}%</span>
                                    <span className='stat-sub'>{apiDataObj.summary?.neutral} articles</span>
                                </div>

                            </div>

                            <DonutChart
                                className="donutchart"
                                innerRadius={0.62}
                                outerRadius={0.9}
                                legend={false}
                                width={220}
                                height={220}
                                colors={["#f5c842", "#e8614a", "#5ba8d4"]}
                                data={[
                                    { label: 'positive', value: apiDataObj.summary?.positive_pct },
                                    { label: 'negative', value: apiDataObj.summary?.negative_pct },
                                    { label: 'neutral',  value: apiDataObj.summary?.neutral_pct },
                                ].sort((a, b) => b.value - a.value)}
                            />
                        </div>

                        {/* Articles */}
                        <div className='articles-list'>
                            {apiDataObj?.articles?.map(obj => {
                                const sentClass = getSentimentClass(obj.sentiment_label)
                                return (
                                    <div className='article-card' key={obj.id}>
                                        <span className='article-index'>{obj.id}</span>
                                        <span className='article-title'>{obj.title}</span>
                                        <div className='article-sentiment'>
                                            <span className={`sentiment-badge ${sentClass}`}>
                                                {obj.sentiment_label}
                                            </span>
                                            <span className='confidence'>{obj.confidence_score_pct}%</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default App