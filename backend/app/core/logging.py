"""Logging configuration for the application."""
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

from loguru import logger

from app.core.config import settings

# Create logs directory if it doesn't exist
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)


class InterceptHandler(logging.Handler):
    """Intercepts standard logging and redirects to loguru."""
    
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """Configure logging for the application."""
    # Remove default loguru handler
    logger.remove()
    
    # Get environment-specific configuration
    config = settings.get_logging_config()
    
    # Add console handler for non-production environments
    if settings.DEBUG:
        logger.add(
            sys.stdout,
            format=config["format"],
            level=config["level"],
            colorize=True,
        )
    
    # Add file handler for all environments
    logger.add(
        LOGS_DIR / "app.log",
        format=config["format"],
        level=config["level"],
        rotation=config["rotation"],
        retention=config["retention"],
        compression=config["compression"],
    )

    # Intercept standard library logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Intercept uvicorn logging
    for _log in ["uvicorn", "uvicorn.error", "fastapi"]:
        _logger = logging.getLogger(_log)
        _logger.handlers = [InterceptHandler()]

    logger.info(
        "Logging configured successfully",
        environment=settings.ENVIRONMENT,
        level=config["level"],
    )


def get_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid4()) 