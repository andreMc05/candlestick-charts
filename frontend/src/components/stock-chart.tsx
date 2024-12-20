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
    Bar,
    Line
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
    prices: PriceData[];
    change_percent: number;
    current_price: number;
    market_cap?: number;
    pe_ratio?: number;
}

interface PriceData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    sma_20?: number;
    upper_band?: number;
    lower_band?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border rounded shadow-lg">
                <p className="font-bold">{label ? new Date(label).toLocaleDateString() : ''}</p>
                <p className="text-[var(--chart-1)]">Open: ${payload[0].payload.open?.toFixed(2)}</p>
                <p className="text-[var(--chart-2)]">Close: ${payload[0].payload.close?.toFixed(2)}</p>
                <p className="text-[var(--chart-3)]">High: ${payload[0].payload.high?.toFixed(2)}</p>
                <p className="text-[var(--chart-4)]">Low: ${payload[0].payload.low?.toFixed(2)}</p>
                <p className="text-[var(--chart-5)]">Volume: {payload[0].payload.volume?.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

const CandlestickChart = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [period, setPeriod] = useState('1mo');
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStockData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:8000/api/stock/${symbol}?period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch stock data');
            const data = await response.json();
            if (isValidStockData(data)) {
                setStockData(data);
            } else {
                throw new Error('Invalid data format received from API');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const isValidStockData = (data: any): data is StockData => {
        return (
            data &&
            Array.isArray(data.prices) &&
            typeof data.change_percent === 'number' &&
            typeof data.current_price === 'number' &&
            data.prices.every((price: any) => (
                typeof price.timestamp === 'string' &&
                typeof price.open === 'number' &&
                typeof price.high === 'number' &&
                typeof price.low === 'number' &&
                typeof price.close === 'number' &&
                typeof price.volume === 'number'
            ))
        );
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    const formatPrice = (value: number): string => `$${value.toFixed(2)}`;

    const renderStockInfo = (): React.ReactNode => {
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
                                        yAxisId="price"
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <YAxis
                                        yAxisId="volume"
                                        orientation="right"
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                    />
                                    <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
                                    <Legend />
                                    
                                    <Line
                                        type="monotone"
                                        dataKey="high"
                                        stroke="var(--chart-3)"
                                        dot={false}
                                        yAxisId="price" 
                                        name="High"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="low"
                                        stroke="var(--chart-4)"
                                        dot={false}
                                        yAxisId="price"
                                        name="Low"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="open"
                                        stroke="var(--chart-1)"
                                        dot={false}
                                        yAxisId="price"
                                        name="Open"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="close"
                                        stroke="var(--chart-2)"
                                        dot={false}
                                        yAxisId="price"
                                        name="Close"
                                    />

                                    <Bar
                                        dataKey="volume"
                                        fill="var(--chart-5)"
                                        opacity={0.3}
                                        yAxisId="volume"
                                        name="Volume"
                                    />

                                    {stockData.prices[0]?.sma_20 && (
                                        <Line
                                            type="monotone"
                                            dataKey="sma_20"
                                            stroke="#ff7300"
                                            dot={false}
                                            yAxisId="price"
                                            name="SMA 20"
                                        />
                                    )}
                                    {stockData.prices[0]?.upper_band && (
                                        <>
                                            <Line
                                                type="monotone"
                                                dataKey="upper_band"
                                                stroke="#82ca9d"
                                                dot={false}
                                                yAxisId="price"
                                                name="Upper Band"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="lower_band"
                                                stroke="#82ca9d"
                                                dot={false}
                                                yAxisId="price"
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