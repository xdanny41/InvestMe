import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Watchlist.css';

const STOCK_NAMES = {
    AAPL: "Apple",
    MSFT: "Microsoft",
    NVDA: "NVIDIA",
    AMZN: "Amazon",
    TSLA: "Tesla",
    META: "Meta Platforms",
    GOOGL: "Alphabet"
};

const MAGNIFICENT_7 = Object.keys(STOCK_NAMES);

function Watchlist() {
    const [stockData, setStockData] = useState({});
    const API_KEY = "cuoh6spr01qve8ptb120cuoh6spr01qve8ptb12g";

    const fetchStockPrices = useCallback(async () => {
        try {
            const responses = await Promise.all(
                MAGNIFICENT_7.map(symbol =>
                    axios.get(`https://finnhub.io/api/v1/quote`, {
                        params: {
                            symbol: symbol,
                            token: API_KEY,
                        },
                    })
                )
            );

            const prices = {};
            responses.forEach((response, index) => {
                prices[MAGNIFICENT_7[index]] = response.data;
            });

            setStockData(prices);
        } catch (error) {
            console.error("Error fetching stock prices:", error);
        }
    }, [API_KEY]);

    useEffect(() => {
        fetchStockPrices();
        const interval = setInterval(fetchStockPrices, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchStockPrices]);

    return (
        <div className="watchlist">
            <h2>Watchlist</h2>
            <table className="watchlist-table" style={{ width: '100%', borderSpacing: '15px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>Stock</th>
                        <th style={{ textAlign: 'center' }}>Price</th>
                        <th style={{ textAlign: 'center' }}>Change</th>
                    </tr>
                </thead>
                <tbody>
                    {MAGNIFICENT_7.map((symbol) => {
                        const stock = stockData[symbol];
                        return (
                            <tr key={symbol}>
                                <td style={{ textAlign: 'center' }}>
                                    <strong>{symbol}</strong>
                                    <br />
                                    <span className="company-name" style={{ fontSize: '0.7em', color: '#666' }}>{STOCK_NAMES[symbol]}</span>
                                </td>
                                <td style={{ textAlign: 'left' }}>{stock ? `$${stock.c.toFixed(2)}` : 'Fetching...'}</td>
                                <td style={{fontWeight: 'bold', color: stock?.d >= 0 ? 'green' : 'red' }}>
                                    {stock ? (stock.d >= 0 ? `+${stock.d.toFixed(2)}` : stock.d.toFixed(2)) : 'Fetching...'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Watchlist;
