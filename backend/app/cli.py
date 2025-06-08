"""CLI commands for the application."""
import asyncio
import logging
import typer
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings
from app.seeds import run_seeds
from app.data_processing.bga_processor import process_bga_data
from app.data_processing.player_stats_parser import process_all_player_stats
from app.data_processing.session_processor import process_all_session_data

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
            # Import all models to ensure they're included in metadata
            from app.models.base import Base
            import app.models  # This imports all models
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


@app.command()
def process_bga(
    data_path: str = typer.Option(
        "data",
        "--data-path",
        "-d",
        help="Path to the data directory containing BGA data",
    )
):
    """Process BoardGameArena data and import into database."""
    async def _process_bga():
        try:
            results = await process_bga_data(data_path)
            
            print("\n🎲 BGA Data Processing Results:")
            print(f"   Games processed: {results['games_processed']}")
            print(f"   Players processed: {results['players_processed']}")
            print(f"   Game history records: {results['game_history_processed']}")
            print(f"   Errors: {results['errors']}")
            
            if results['errors'] > 0:
                print("\n⚠️  Some errors occurred during processing. Check logs for details.")
            else:
                print("\n✅ BGA data processing completed successfully!")
                
        except Exception as e:
            logger.error(f"Error processing BGA data: {e}")
            raise typer.Exit(1)

    try:
        asyncio.run(_process_bga())
    except Exception as e:
        logger.error(f"Error in BGA data processing: {e}")
        raise typer.Exit(1)


@app.command()
def extract_player_stats(
    data_path: str = typer.Option(
        "data",
        "--data-path",
        "-d",
        help="Path to the data directory containing player profile HTML files",
    )
):
    """Extract game statistics from player profile HTML files."""
    from pathlib import Path
    
    try:
        data_root = Path(data_path)
        
        print("🎮 Starting player stats extraction...")
        all_stats = process_all_player_stats(data_root)
        
        print(f"\n📊 Player Stats Extraction Results:")
        for player_name, stats in all_stats.items():
            print(f"   {player_name}: {stats['total_games_with_stats']} games with stats")
            if stats['overall_stats']:
                if 'total_games_played' in stats['overall_stats']:
                    print(f"      Total games played: {stats['overall_stats']['total_games_played']}")
                if 'total_xp' in stats['overall_stats']:
                    print(f"      Total XP: {stats['overall_stats']['total_xp']}")
        
        print(f"\n✅ Successfully extracted stats for {len(all_stats)} players!")
        
    except Exception as e:
        print(f"❌ Error during player stats extraction: {e}")
        raise typer.Exit(1)


@app.command()
def process_sessions(
    data_path: str = typer.Option(
        "data",
        "--data-path",
        "-d",
        help="Path to the data directory containing BGA session data",
    )
):
    """Process BoardGameArena multi-player session data."""
    async def _process_sessions():
        try:
            results = await process_all_session_data(data_path)
            
            print("\n🎮 BGA Session Processing Results:")
            print(f"   Sessions processed: {results['sessions_processed']}")
            print(f"   Players processed: {results['players_processed']}")
            print(f"   Errors: {results['errors']}")
            
            if results['errors'] > 0:
                print("\n⚠️  Some errors occurred during processing. Check logs for details.")
            else:
                print("\n✅ Session processing completed successfully!")
                
        except Exception as e:
            print(f"\n❌ Error processing sessions: {e}")
            raise typer.Exit(1)
    
    asyncio.run(_process_sessions())


if __name__ == "__main__":
    app() 