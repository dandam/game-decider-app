"""Seeder for game sessions between our core players."""
import random
from datetime import datetime, timedelta
from typing import List

from app.models.game_session import GameSession
from app.models.game import Game
from app.seeds.seeders.base import BaseSeed


class GameSessionsSeeder(BaseSeed):
    """Seeds game sessions showing how our four players perform against each other."""
    
    # Our four core players
    PLAYERS = ["dandam", "superoogie", "permagoof", "gundlach"]
    
    # Sample games they might play together
    SAMPLE_GAMES = [
        {"name": "Catan", "bga_id": "13"},
        {"name": "Ticket to Ride", "bga_id": "9"},
        {"name": "Splendor", "bga_id": "1606"},
        {"name": "Azul", "bga_id": "1879"},
        {"name": "Pandemic", "bga_id": "1606"},
        {"name": "7 Wonders", "bga_id": "1127"},
        {"name": "King of Tokyo", "bga_id": "1320"},
        {"name": "Wingspan", "bga_id": "2228"},
        {"name": "Scythe", "bga_id": "2008"},
        {"name": "Terraforming Mars", "bga_id": "2146"},
    ]
    
    async def run(self) -> None:
        """Generate placeholder game session data."""
        print("🎲 Seeding game sessions...")
        
        # Generate sessions over the past 6 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        
        sessions_created = 0
        
        # Generate 50 game sessions with various player combinations
        for i in range(50):
            # Random date in the past 6 months
            days_ago = random.randint(0, 180)
            play_date = end_date - timedelta(days=days_ago)
            
            # Random game
            game_info = random.choice(self.SAMPLE_GAMES)
            
            # Random player combination (2-4 players)
            num_players = random.randint(2, 4)
            session_players = random.sample(self.PLAYERS, num_players)
            
            # Generate scores and rankings
            scores = self._generate_scores(game_info["name"], num_players)
            rankings = list(range(1, num_players + 1))
            
            # Sort players by ranking (winner first)
            player_ranking_pairs = list(zip(session_players, scores, rankings))
            player_ranking_pairs.sort(key=lambda x: x[2])  # Sort by ranking
            
            sorted_players = [p[0] for p in player_ranking_pairs]
            sorted_scores = [p[1] for p in player_ranking_pairs]
            sorted_rankings = [p[2] for p in player_ranking_pairs]
            
            # Create game session
            session = GameSession(
                bga_table_id=f"table_{1000000 + i}",
                bga_game_id=game_info["bga_id"],
                game_name=game_info["name"],
                play_date=play_date,
                player_ids=sorted_players,  # Using usernames as IDs for now
                player_names=sorted_players,
                scores=sorted_scores,
                rankings=sorted_rankings,
                game_duration_minutes=random.randint(30, 120),
                notes=f"Game session #{i+1} - {game_info['name']} with {num_players} players",
                bga_metadata={
                    "game_type": "standard",
                    "table_type": "friendly",
                    "session_number": i + 1
                }
            )
            
            self.session.add(session)
            sessions_created += 1
        
        await self.session.commit()
        print(f"✅ Created {sessions_created} game sessions")
    
    def _generate_scores(self, game_name: str, num_players: int) -> List[int]:
        """Generate realistic scores based on the game type."""
        if game_name in ["Catan", "Ticket to Ride"]:
            # Victory point games (0-15 range)
            base_scores = [random.randint(8, 15) for _ in range(num_players)]
        elif game_name in ["Splendor", "7 Wonders"]:
            # Medium scoring games (10-50 range)
            base_scores = [random.randint(15, 45) for _ in range(num_players)]
        elif game_name in ["Wingspan", "Terraforming Mars"]:
            # High scoring games (50-150 range)
            base_scores = [random.randint(60, 140) for _ in range(num_players)]
        elif game_name in ["Pandemic"]:
            # Cooperative game - all win or all lose
            won = random.choice([True, False])
            base_scores = [1 if won else 0] * num_players
        else:
            # Default scoring
            base_scores = [random.randint(10, 50) for _ in range(num_players)]
        
        # Ensure scores are different (except for cooperative games)
        if game_name != "Pandemic":
            while len(set(base_scores)) != len(base_scores):
                base_scores = [score + random.randint(-2, 2) for score in base_scores]
                base_scores = [max(0, score) for score in base_scores]  # No negative scores
        
        return base_scores 