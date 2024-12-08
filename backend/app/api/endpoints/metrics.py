from fastapi import APIRouter, HTTPException
from app.services.rate_limiter import RateLimiter
from app.models.schemas import ApiMetrics

router = APIRouter()
rate_limiter = RateLimiter()

@router.get("/metrics/{api_name}", response_model=ApiMetrics)
async def get_api_metrics(api_name: str):
    metrics = await rate_limiter.track_request(api_name)
    if not metrics:
        raise HTTPException(status_code=500, detail="Failed to get metrics")
    return metrics