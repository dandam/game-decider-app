"""API router for v1 endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Request
from loguru import logger
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

api_router = APIRouter()


@api_router.get("/health")
async def health_check(request: Request):
    """Check API health."""
    logger.info(
        "Health check requested",
        request_id=getattr(request.state, "request_id", None),
    )
    return {
        "status": "healthy",
        "service": "game-night-api",
        "request_id": getattr(request.state, "request_id", None),
    }


@api_router.get("/health/db")
async def database_health_check(
    request: Request, db: AsyncSession = Depends(get_db)
):
    """Check database connection health."""
    try:
        # Test database connection
        result = await db.execute(text("SELECT 1"))
        row = result.scalar()
        if row != 1:
            raise HTTPException(
                status_code=503,
                detail="Database query returned unexpected result",
            )
        
        logger.info(
            "Database health check successful",
            request_id=getattr(request.state, "request_id", None),
        )
        
        return {
            "status": "healthy",
            "message": "Database connection successful",
            "request_id": getattr(request.state, "request_id", None),
        }
        
    except Exception as e:
        logger.error(
            "Database health check failed",
            request_id=getattr(request.state, "request_id", None),
            error=str(e),
        )
        
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) 