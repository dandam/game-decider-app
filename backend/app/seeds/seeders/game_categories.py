"""Game categories seeder module."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game_category import GameCategory
from app.seeds.seeders.base import BaseSeed


SAMPLE_CATEGORIES = [
    {
        "name": "Strategy",
        "description": "Games that emphasize strategic planning and decision making",
    },
    {
        "name": "Party",
        "description": "Light-hearted games perfect for social gatherings",
    },
    {
        "name": "Cooperative",
        "description": "Games where players work together against the game",
    },
    {
        "name": "Deck Building",
        "description": "Games where players construct and manage their own deck of cards",
    },
    {
        "name": "Area Control",
        "description": "Games where players compete for control of territories",
    },
    {
        "name": "Worker Placement",
        "description": "Games where players assign workers to perform actions",
    },
    {
        "name": "Roll & Write",
        "description": "Games where players roll dice and write results on sheets",
    },
    {
        "name": "Tile Placement",
        "description": "Games where players strategically place tiles to score points",
    },
]


class GameCategoriesSeeder(BaseSeed):
    """Seeder for game categories."""
    
    def __init__(self, session: AsyncSession):
        """Initialize the seeder."""
        super().__init__(session)
    
    async def run(self) -> None:
        """Run the seeder."""
        categories = [GameCategory(**data) for data in SAMPLE_CATEGORIES]
        self.session.add_all(categories)
        await self.session.commit() 