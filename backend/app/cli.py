"""CLI commands for the application."""
import asyncio
import logging
import typer
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings
from app.seeds import run_seeds

app = typer.Typer()
logger = logging.getLogger(__name__)


@app.callback()
def callback():
    """Game Night Concierge CLI."""


@app.command()
def seed(
    reset: bool = typer.Option(
        False,
        "--reset",
        "-r",
        help="Drop all tables before seeding",
    )
):
    """Seed the database with sample data."""
    async def _seed():
        # Create async engine
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = async_sessionmaker(engine, expire_on_commit=False)

        if reset:
            # Import here to avoid circular imports
            from app.models.base import Base
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
                await conn.run_sync(Base.metadata.create_all)

        # Run seeds
        async with async_session() as session:
            await run_seeds(session)

    try:
        asyncio.run(_seed())
        logger.info("Database seeding completed successfully")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise typer.Exit(1)


if __name__ == "__main__":
    app() 