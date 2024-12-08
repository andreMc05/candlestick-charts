"use client"

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

interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockResponse {
  prices: PriceData[];
  current_price: number;
  change_percent: number;
  market_cap?: number;
  pe_ratio?: number;
}

export default function Chart() {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [period, setPeriod] = useState<string>('1mo');
  const [stockData, setStockData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/stock/${symbol}?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data: StockResponse = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const formatPrice = (value: number): string => `${value}`;

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
              {stockData.market_cap ? `${(stockData.market_cap / 1e9)}B` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">P/E Ratio</div>
            <div className="text-xl font-bold">
              {stockData.pe_ratio ? stockData.pe_ratio : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const periods: string[] = ['1d', '5d', '1mo', '3mo', '6mo', '1y'];

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
                    tickFormatter={formatPrice}
                    orientation="left"
                  />
                  <YAxis 
                    yAxisId="volume"
                    orientation="right"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="close"
                    fill="#8884d8"
                    stroke="#8884d8"
                    fillOpacity={0.3}
                    name="Price"
                    yAxisId="price"
                  />
                  <Bar
                    dataKey="volume"
                    fill="#82ca9d"
                    yAxisId="volume"
                    name="Volume"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}