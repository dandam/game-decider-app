"""Error handling configuration."""
from typing import Any, Dict, Optional, Union, cast

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    """Base application error."""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(message)


def create_error_response(
    status_code: int,
    message: str,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a standardized error response."""
    response: Dict[str, Any] = {
        "error": {
            "message": message,
            "status_code": status_code,
        }
    }
    
    if error_code:
        response["error"]["code"] = error_code
    if details:
        response["error"]["details"] = details
    if request_id:
        response["request_id"] = request_id
        
    return response


async def validation_error_handler(
    request: Request, exc: Union[RequestValidationError, ValidationError]
) -> JSONResponse:
    """Handle validation errors from FastAPI and Pydantic."""
    errors = []
    for error in exc.errors():
        error_dict = {
            "loc": " -> ".join(str(loc) for loc in error["loc"]),
            "msg": error["msg"],
            "type": error["type"],
        }
        errors.append(error_dict)
    
    logger.warning(
        "Validation error",
        request_id=getattr(request.state, "request_id", None),
        errors=errors,
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Validation error",
            error_code="VALIDATION_ERROR",
            details={"errors": errors},
            request_id=getattr(request.state, "request_id", None),
        ),
    )


async def http_error_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Handle HTTP exceptions."""
    logger.warning(
        "HTTP error",
        request_id=getattr(request.state, "request_id", None),
        status_code=exc.status_code,
        detail=exc.detail,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            status_code=exc.status_code,
            message=str(exc.detail),
            request_id=getattr(request.state, "request_id", None),
        ),
    )


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle application-specific errors."""
    logger.error(
        "Application error",
        request_id=getattr(request.state, "request_id", None),
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            status_code=exc.status_code,
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
            request_id=getattr(request.state, "request_id", None),
        ),
    )


def setup_error_handlers(app: FastAPI) -> None:
    """Configure application error handlers."""
    app.add_exception_handler(
        RequestValidationError,
        cast(Any, validation_error_handler),
    )
    app.add_exception_handler(
        ValidationError,
        cast(Any, validation_error_handler),
    )
    app.add_exception_handler(
        StarletteHTTPException,
        cast(Any, http_error_handler),
    )
    app.add_exception_handler(
        AppError,
        cast(Any, app_error_handler),
    ) 