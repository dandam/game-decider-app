"""Main application module."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import setup_error_handlers
from app.core.logging import setup_logging
from app.core.middleware import setup_middleware

# Configure logging first
setup_logging()

# Create FastAPI application
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure middleware and error handlers
setup_middleware(app)
setup_error_handlers(app)

# Import and include routers
from app.api.v1.router import api_router  # noqa: E402

app.include_router(api_router, prefix="/api/v1") 