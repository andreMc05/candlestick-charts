import redis
import json
from datetime import datetime
from typing import Dict, Optional
from app.core.config import settings
from app.core.logging import logger
from app.models.schemas import ApiMetrics

class APILimits:
    ALPHA_VANTAGE = {
        "calls_per_min": 5,
        "calls_per_day": 500,
    }
    FINNHUB = {
        "calls_per_min": 60,
        "calls_per_day": 1500,
    }
    YAHOO_FINANCE = {
        "calls_per_min": 100,
        "calls_per_day": 2000,
    }

class RateLimiter:
    def __init__(self, redis_url: str = settings.REDIS_URL):
        self.redis_client = redis.Redis.from_url(
            redis_url, 
            decode_responses=True,
            socket_timeout=5
        )
        self.limits = APILimits()

    def _get_key(self, api_name: str, period: str) -> str:
        current_time = datetime.now()
        if period == "minute":
            time_block = current_time.strftime("%Y-%m-%d-%H-%M")
        else:
            time_block = current_time.strftime("%Y-%m-%d")
        return f"api_usage:{api_name}:{period}:{time_block}"

    async def track_request(self, api_name: str) -> Optional[ApiMetrics]:
        try:
            minute_key = self._get_key(api_name, "minute")
            daily_key = self._get_key(api_name, "daily")
            
            pipe = self.redis_client.pipeline()
            pipe.incr(minute_key)
            pipe.expire(minute_key, 60)
            pipe.incr(daily_key)
            pipe.expire(daily_key, 24 * 60 * 60)
            
            minute_count, _, daily_count, _ = pipe.execute()
            
            limits = getattr(self.limits, api_name)
            
            return ApiMetrics(
                minute_usage={
                    "current": int(minute_count),
                    "limit": limits["calls_per_min"],
                    "remaining": max(0, limits["calls_per_min"] - int(minute_count))
                },
                daily_usage={
                    "current": int(daily_count),
                    "limit": limits["calls_per_day"],
                    "remaining": max(0, limits["calls_per_day"] - int(daily_count))
                },
                last_updated=datetime.now().isoformat()
            )
        except Exception as e:
            logger.error(f"Error tracking request: {str(e)}")
            return None

    async def check_rate_limit(self, api_name: str) -> bool:
        metrics = await self.track_request(api_name)
        if not metrics:
            return False
            
        return (
            metrics.minute_usage.current <= metrics.minute_usage.limit and
            metrics.daily_usage.current <= metrics.daily_usage.limit
        )