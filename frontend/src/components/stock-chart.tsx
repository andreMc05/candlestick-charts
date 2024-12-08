import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Bar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

const CandlestickChart = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [period, setPeriod] = useState('1mo');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStockData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:8000/api/stock/${symbol}?period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch stock data');
            const data = await response.json();
            setStockData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    const formatPrice = (value) => `$${value.toFixed(2)}`;

    const renderStockInfo = () => {
        if (!stockData) return null;

        const changeColor = stockData.change_percent >= 0 ? 'text-green-500' : 'text-red-500';
        const ChangeIcon = stockData.change_percent >= 0 ? TrendingUp : TrendingDown;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatPrice(stockData.current_price)}</div>
                        <div className={`flex items-center ${changeColor}`}>
                            <ChangeIcon className="w-4 h-4 mr-1" />
                            {stockData.change_percent}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-gray-500">Market Cap</div>
                        <div className="text-xl font-bold">
                            {stockData.market_cap ? `$${(stockData.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-gray-500">P/E Ratio</div>
                        <div className="text-xl font-bold">
                            {stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y'];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Stock Analysis</h1>
                <div className="flex gap-4">
                    <Input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter stock symbol (e.g., AAPL)"
                        className="max-w-xs"
                    />
                    <Button onClick={fetchStockData} disabled={loading}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>

            {renderStockInfo()}

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Price Chart</CardTitle>
                    <div className="flex gap-2">
                        {periods.map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? 'default' : 'outline'}
                                onClick={() => setPeriod(p)}
                                className="px-3 py-1"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : stockData ? (
                        <div className="h-[600px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={stockData.prices}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tickFormatter={formatPrice}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [formatPrice(value), name]}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="close"
                                        fill="#8884d8"
                                        stroke="#8884d8"
                                        fillOpacity={0.1}
                                        name="Close Price"
                                    />
                                    <Bar
                                        dataKey="volume"
                                        fill="#82ca9d"
                                        opacity={0.5}
                                        yAxisId={1}
                                        name="Volume"
                                    />
                                    {stockData.prices[0].sma_20 && (
                                        <Area
                                            type="monotone"
                                            dataKey="sma_20"
                                            stroke="#ff7300"
                                            fill="none"
                                            name="SMA 20"
                                        />
                                    )}
                                    {stockData.prices[0].upper_band && (
                                        <>
                                            <Area
                                                type="monotone"
                                                dataKey="upper_band"
                                                stroke="#82ca9d"
                                                fill="none"
                                                name="Upper Band"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="lower_band"
                                                stroke="#82ca9d"
                                                fill="none"
                                                name="Lower Band"
                                            />
                                        </>
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
};

export default CandlestickChart;