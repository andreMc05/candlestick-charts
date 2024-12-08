from fastapi import APIRouter, HTTPException
from typing import List
from app.services.stock_service import StockService
from app.models.schemas import StockData
from app.core.logging import logger

router = APIRouter()
stock_service = StockService()

@router.get("/stock/{symbol}", response_model=List[StockData])
async def get_stock_data(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d"
):
    try:
        data = await stock_service.get_stock_data(symbol, period, interval)
        return data
    except Exception as e:
        logger.error(f"Error in stock endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))