"""Games seeder module."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.game_tag import GameTag
from app.seeds.seeders.base import BaseSeed


SAMPLE_GAMES = [
    {
        "name": "Catan",
        "description": "Classic resource management and trading game",
        "min_players": 3,
        "max_players": 4,
        "average_play_time": 90,
        "complexity_rating": 2.3,
        "categories": ["Strategy", "Economic"],
        "tags": ["Family Friendly", "Competitive"],
    },
    {
        "name": "Pandemic",
        "description": "Save humanity from deadly diseases spreading across the globe",
        "min_players": 2,
        "max_players": 4,
        "average_play_time": 45,
        "complexity_rating": 2.4,
        "categories": ["Cooperative", "Strategy"],
        "tags": ["Team Based", "Family Friendly"],
    },
    {
        "name": "7 Wonders",
        "description": "Build ancient civilizations through card drafting",
        "min_players": 2,
        "max_players": 7,
        "average_play_time": 30,
        "complexity_rating": 2.3,
        "categories": ["Card Game", "Strategy"],
        "tags": ["Quick Play", "Competitive"],
    },
    {
        "name": "Ticket to Ride",
        "description": "Build train routes across countries and continents",
        "min_players": 2,
        "max_players": 5,
        "average_play_time": 60,
        "complexity_rating": 1.9,
        "categories": ["Strategy", "Family"],
        "tags": ["Family Friendly", "Beginner Friendly"],
    },
]


class GamesSeeder(BaseSeed):
    """Seeder for games."""
    
    def __init__(self, session: AsyncSession):
        """Initialize the seeder."""
        super().__init__(session)
    
    async def run(self) -> None:
        """Run the seeder."""
        # Get all categories and tags
        categories = {
            cat.name: cat
            for cat in (await self.session.execute(select(GameCategory))).scalars()
        }
        tags = {
            tag.name: tag
            for tag in (await self.session.execute(select(GameTag))).scalars()
        }
        
        # Create games with relationships
        for game_data in SAMPLE_GAMES:
            # Extract and remove relationship data
            category_names = game_data.pop("categories")
            tag_names = game_data.pop("tags")
            
            # Create game
            game = Game(**game_data)
            
            # Add relationships
            game.categories = [
                categories[name]
                for name in category_names
                if name in categories
            ]
            game.tags = [
                tags[name]
                for name in tag_names
                if name in tags
            ]
            
            self.session.add(game)
        
        await self.session.commit() 