"""Seed runner module for coordinating database seeding."""
import asyncio
import logging
from typing import List, Type

from sqlalchemy.ext.asyncio import AsyncSession

from app.seeds.seeders.base import BaseSeed
from app.seeds.seeders.game_categories import GameCategoriesSeeder
from app.seeds.seeders.game_tags import GameTagsSeeder
from app.seeds.seeders.games import GamesSeeder
from app.seeds.seeders.players import PlayersSeeder

logger = logging.getLogger(__name__)

# Order matters - seeders will run in this sequence
SEEDERS: List[Type[BaseSeed]] = [
    GameCategoriesSeeder,
    GameTagsSeeder,
    GamesSeeder,
    PlayersSeeder,
]


async def run_seeds(session: AsyncSession) -> None:
    """Run all seeders in sequence.
    
    Args:
        session: The database session to use for seeding.
    """
    logger.info("Starting database seeding...")
    
    for seeder_class in SEEDERS:
        seeder = seeder_class(session)
        logger.info(f"Running {seeder_class.__name__}...")
        await seeder.run()
        logger.info(f"Completed {seeder_class.__name__}")
    
    logger.info("Database seeding completed successfully") 