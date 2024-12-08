from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime
from enum import Enum

class ErrorLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class StockData(BaseModel):
    symbol: str
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float]
    ema_20: Optional[float]
    rsi: Optional[float]

class ApiUsage(BaseModel):
    current: int
    limit: int
    remaining: int

class ApiMetrics(BaseModel):
    minute_usage: ApiUsage
    daily_usage: ApiUsage
    last_updated: str

class ErrorMessage(BaseModel):
    level: ErrorLevel
    message: str
    timestamp: str
    source: str
    details: Optional[Dict] = None