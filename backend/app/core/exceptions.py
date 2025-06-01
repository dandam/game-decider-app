"""Exception handling for the application."""
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    message: str
    error_code: str
    details: Optional[Dict[str, Any]] = None


class AppException(Exception):
    """Base exception for application-specific errors."""
    
    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class ValidationError(AppException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class NotFoundError(AppException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class AuthenticationError(AppException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle application-specific exceptions."""
    logger.error(
        f"Application error: {exc.message}",
        error_code=exc.error_code,
        status_code=exc.status_code,
        details=exc.details,
        path=request.url.path,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
        ).model_dump(),
    )


async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle validation errors."""
    logger.warning(
        f"Validation error: {exc.message}",
        error_code=exc.error_code,
        status_code=exc.status_code,
        details=exc.details,
        path=request.url.path,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
        ).model_dump(),
    )


async def not_found_exception_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    """Handle not found errors."""
    logger.info(
        f"Not found error: {exc.message}",
        error_code=exc.error_code,
        status_code=exc.status_code,
        details=exc.details,
        path=request.url.path,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
        ).model_dump(),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """Register exception handlers with the FastAPI application."""
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(NotFoundError, not_found_exception_handler) 