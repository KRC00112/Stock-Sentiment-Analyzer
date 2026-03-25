import { useEffect, useState } from 'react'
import './App.css'

function App() {
    const [apiDataObj, setApiDataObj] = useState({})
    const [tickerNameInput, setTickerNameInput] = useState('')
    const [tickerName, setTickerName] = useState('')
    const [pageSizeInput, setPageSizeInput] = useState('')
    const [pageSize, setPageSize] = useState(10)

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
        setPageSizeInput('')
    }

    return (
        <>
            <input type='text' onChange={handleTickerInputChange} value={tickerNameInput} />
            <input type='number' onChange={handlePageSizeInputChange} value={pageSizeInput} />
            <button onClick={handleBtnClick}>Get Data</button>
            <div>{JSON.stringify(apiDataObj)}</div>
        </>
    )
}

export default App