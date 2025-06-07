"""Game tags seeder module."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game_tag import GameTag
from app.seeds.seeders.base import BaseSeed


SAMPLE_TAGS = [
    {
        "name": "Family Friendly",
        "description": "Games suitable for all ages and family play",
    },
    {
        "name": "Quick Play",
        "description": "Games that can be completed in under 30 minutes",
    },
    {
        "name": "Heavy Strategy",
        "description": "Complex games with deep strategic elements",
    },
    {
        "name": "Beginner Friendly",
        "description": "Easy to learn games perfect for newcomers",
    },
    {
        "name": "Competitive",
        "description": "Games focused on player vs player competition",
    },
    {
        "name": "Team Based",
        "description": "Games where players work in teams",
    },
    {
        "name": "Economic",
        "description": "Games involving resource management and trading",
    },
    {
        "name": "Storytelling",
        "description": "Games with strong narrative elements",
    },
]


class GameTagsSeeder(BaseSeed):
    """Seeder for game tags."""
    
    def __init__(self, session: AsyncSession):
        """Initialize the seeder."""
        super().__init__(session)
    
    async def run(self) -> None:
        """Run the seeder."""
        tags = [GameTag(**data) for data in SAMPLE_TAGS]
        self.session.add_all(tags)
        await self.session.commit() 