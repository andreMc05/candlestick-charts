import yfinance as yf
import pandas as pd
from typing import List, Optional
from app.models.schemas import StockData
from app.core.logging import logger
from app.services.rate_limiter import RateLimiter

class StockService:
    def __init__(self):
        self.rate_limiter = RateLimiter()

    async def get_stock_data(
        self, 
        symbol: str, 
        period: str = "1mo",
        interval: str = "1d"
    ) -> List[StockData]:
        try:
            # Check rate limit before making request
            if not await self.rate_limiter.check_rate_limit("YAHOO_FINANCE"):
                raise Exception("Rate limit exceeded")

            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                return []

            stock_data = []
            for index, row in hist.iterrows():
                data = StockData(
                    symbol=symbol,
                    timestamp=index.strftime('%Y-%m-%d %H:%M:%S'),
                    open=round(row['Open'], 2),
                    high=round(row['High'], 2),
                    low=round(row['Low'], 2),
                    close=round(row['Close'], 2),
                    volume=int(row['Volume']),
                    sma_20=None,
                    ema_20=None,
                    rsi=None
                )
                stock_data.append(data)
                
            return stock_data
        except Exception as e:
            logger.error(f"Error fetching stock data: {str(e)}")
            raise