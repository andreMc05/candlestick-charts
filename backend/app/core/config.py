from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    ALPHA_VANTAGE_KEY: str
    FINNHUB_KEY: str
    YAHOO_KEY: str
    POLYGON_KEY: str
    REDIS_URL: str  # Works with Docker port mapping
    # REDIS_URL: str = "redis://localhost:6379"  # Works with Docker port mapping
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Redis connection settings
    REDIS_RETRY_ATTEMPTS: int = 5
    REDIS_RETRY_DELAY: int = 1  # seconds
    
    # Use SettingsConfigDict instead of inner Config class
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()