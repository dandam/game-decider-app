"""Players seeder module."""
from datetime import datetime, timezone
from random import choice, randint, sample
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.player import Player
from app.models.player_game_history import PlayerGameHistory
from app.models.player_preferences import PlayerPreferences
from app.seeds.seeders.base import BaseSeed


SAMPLE_PLAYERS = [
    {
        "username": "alice_gamer",
        "display_name": "Alice",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
    {
        "username": "bob_plays",
        "display_name": "Bob",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
    {
        "username": "carol_dice",
        "display_name": "Carol",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    },
    {
        "username": "dave_meeple",
        "display_name": "Dave",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=dave",
    },
]


def generate_preferences(categories: List[GameCategory]) -> dict:
    """Generate random preferences for a player."""
    return {
        "minimum_play_time": choice([15, 30, 45, 60]),
        "maximum_play_time": choice([60, 90, 120, 180]),
        "preferred_player_count": choice([2, 3, 4, 5, 6]),
        "preferred_complexity_min": round(choice([1.0, 1.5, 2.0, 2.5]), 1),
        "preferred_complexity_max": round(choice([2.5, 3.0, 3.5, 4.0]), 1),
        "preferred_categories": sample(categories, k=randint(2, 4)),
    }


def generate_game_history(games: List[Game], num_plays: int = 5) -> List[dict]:
    """Generate random game history for a player."""
    selected_games = sample(games, k=min(num_plays, len(games)))
    now = datetime.now()
    
    return [
        {
            "game": game,
            "play_date": datetime(
                now.year,
                now.month - randint(0, 2),
                randint(1, 28),
                randint(0, 23),
                randint(0, 59),
            ),
            "rating": round(choice([3.5, 4.0, 4.5, 5.0]), 1),
            "notes": choice([
                "Great game night!",
                "Really enjoyed this one",
                "Would play again",
                "Fun with friends",
                None,
            ]),
        }
        for game in selected_games
    ]


class PlayersSeeder(BaseSeed):
    """Seeder for players."""
    
    def __init__(self, session: AsyncSession):
        """Initialize the seeder."""
        super().__init__(session)
    
    async def run(self) -> None:
        """Run the seeder."""
        # Get all categories and games
        categories = (await self.session.execute(select(GameCategory))).scalars().all()
        games = (await self.session.execute(select(Game))).scalars().all()
        
        # Create players with preferences and history
        for player_data in SAMPLE_PLAYERS:
            # Create player
            player = Player(**player_data)
            self.session.add(player)
            
            # Add preferences
            preferences = PlayerPreferences(
                player=player,
                **generate_preferences(categories),
            )
            self.session.add(preferences)
            
            # Add game history
            for history_data in generate_game_history(games):
                history = PlayerGameHistory(
                    player=player,
                    **history_data,
                )
                self.session.add(history)
        
        await self.session.commit() 