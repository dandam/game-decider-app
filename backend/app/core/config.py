"""Application configuration."""
from enum import Enum
from typing import Any, Dict, List

from pydantic_settings import BaseSettings


class Environment(str, Enum):
    """Application environment types."""
    
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Application settings."""
    
    # Environment
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = True
    
    # Application
    APP_TITLE: str = "Game Night Concierge API"
    APP_DESCRIPTION: str = "API for managing game night sessions and recommendations"
    APP_VERSION: str = "0.1.0"
    
    # Logging
    LOG_LEVEL: str = "DEBUG"  # Override in production
    LOG_FORMAT: str = "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
    LOG_FILE_PATH: str = "logs/app.log"
    LOG_ROTATION: str = "500 MB"
    LOG_RETENTION: str = "10 days"
    LOG_COMPRESSION: str = "zip"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/game_night_dev"
    
    class Config:
        """Pydantic configuration."""
        
        env_file = ".env"
        case_sensitive = True

    def get_logging_config(self) -> Dict[str, Any]:
        """Get logging configuration based on environment."""
        config = {
            "format": self.LOG_FORMAT,
            "rotation": self.LOG_ROTATION,
            "retention": self.LOG_RETENTION,
            "compression": self.LOG_COMPRESSION,
            "level": self.LOG_LEVEL,
            "backtrace": True,
            "diagnose": True,
        }
        
        if self.ENVIRONMENT == Environment.PRODUCTION:
            config["level"] = "INFO"
            config["backtrace"] = False
            config["diagnose"] = False
        
        return config


settings = Settings() 