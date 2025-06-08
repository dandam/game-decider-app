"""BoardGameArena data processor for importing collected data."""
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.game import Game
from app.models.player import Player
from app.models.player_game_history import PlayerGameHistory
from app.core.database import get_db
from app.data_processing.player_stats_parser import process_all_player_stats


class BGADataProcessor:
    """Processes BoardGameArena data and imports it into the database."""
    
    def __init__(self, data_root: Path):
        """Initialize processor with data directory path."""
        self.data_root = data_root
        self.raw_data_path = data_root / "raw"
        self.processed_data_path = data_root / "processed"
        
        # Ensure processed directory exists
        self.processed_data_path.mkdir(exist_ok=True)
    
    async def process_all_data(self, session: AsyncSession) -> Dict[str, int]:
        """Process all BGA data and import into database."""
        results = {
            "games_processed": 0,
            "players_processed": 0,
            "game_history_processed": 0,
            "player_stats_extracted": 0,
            "errors": 0
        }
        
        try:
            # Process games first
            games_data = self.extract_games_data()
            results["games_processed"] = await self.import_games(session, games_data)
            
            # Extract player stats from HTML profiles first
            print("Extracting player statistics from HTML profiles...")
            player_stats = process_all_player_stats(self.data_root)
            results["player_stats_extracted"] = len(player_stats)
            
            # Process players and their game history
            for player_dir in self.get_player_directories():
                try:
                    player_data = self.extract_player_data(player_dir, player_stats)
                    if player_data:
                        await self.import_player_data(session, player_data)
                        results["players_processed"] += 1
                        
                        # Process game history for this player
                        history_count = await self.import_player_game_history(
                            session, player_data
                        )
                        results["game_history_processed"] += history_count
                        
                except Exception as e:
                    print(f"Error processing player {player_dir.name}: {e}")
                    results["errors"] += 1
            
            await session.commit()
            
        except Exception as e:
            print(f"Error in process_all_data: {e}")
            await session.rollback()
            results["errors"] += 1
            
        return results
    
    def extract_games_data(self) -> List[Dict[str, str]]:
        """Extract games data from BGA games HTML file."""
        games_file = self.raw_data_path / "games-bga" / "game-list-and-IDs.html"
        
        if not games_file.exists():
            print(f"Games file not found: {games_file}")
            return []
        
        games = []
        
        try:
            with open(games_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse HTML and extract option elements
            soup = BeautifulSoup(content, 'html.parser')
            options = soup.find_all('option')
            
            for option in options:
                value = option.get('value', '').strip()
                name = option.get_text().strip()
                
                # Skip empty values and "Any games" option
                if value and value.isdigit() and name and name != "Any games":
                    games.append({
                        "bga_id": value,
                        "name": name,
                        # Set default values for required fields
                        "min_players": 2,
                        "max_players": 4,
                        "average_play_time": 60,
                        "complexity_rating": 2.5
                    })
            
            print(f"Extracted {len(games)} games from BGA data")
            
        except Exception as e:
            print(f"Error extracting games data: {e}")
            
        return games
    
    def get_player_directories(self) -> List[Path]:
        """Get list of player directories."""
        player_profiles_dir = self.raw_data_path / "player-profiles"
        
        if not player_profiles_dir.exists():
            return []
        
        return [
            d for d in player_profiles_dir.iterdir() 
            if d.is_dir() and not d.name.startswith('.')
        ]
    
    def extract_player_data(self, player_dir: Path, player_stats: Optional[Dict] = None) -> Optional[Dict]:
        """Extract player data from profile HTML and stats JSON."""
        player_name = player_dir.name
        
        # Look for profile HTML file (try different naming patterns)
        profile_file = player_dir / f"{player_name}-bga-profile.html"
        if not profile_file.exists():
            profile_file = player_dir / f"{player_name}-profile.html"
        
        if not profile_file.exists():
            print(f"Profile file not found for {player_name}")
            return None

        try:
            with open(profile_file, 'r', encoding='utf-8') as f:
                profile_content = f.read()
            
            # Extract basic player info from HTML
            soup = BeautifulSoup(profile_content, 'html.parser')
            
            # Extract actual BGA username from profile
            name_element = soup.find('span', id='real_player_name')
            bga_username = name_element.get_text().strip() if name_element else player_name
            display_name = bga_username
            
            # Use local avatar file instead of external URL
            avatar_file = player_dir / f"{player_name}-avatar.jpg"
            if avatar_file.exists():
                # Use relative path for local avatar
                avatar_url = f"/avatars/{player_name}-avatar.jpg"
            else:
                avatar_url = None
            
            # Use extracted player stats if available
            game_history = []
            if player_stats and player_name in player_stats:
                stats_data = player_stats[player_name]
                # Convert game statistics to game history format
                # Since we don't have individual play dates, we'll create aggregate entries
                for game_stat in stats_data.get('game_statistics', []):
                    if game_stat.get('games_played', 0) > 0:
                        # Create a synthetic game history entry from stats
                        # Use current date as placeholder since we don't have actual play dates
                        from datetime import datetime
                        placeholder_date = datetime.now()
                        
                        # Calculate average rating based on win percentage
                        win_pct = game_stat.get('win_percentage', 0)
                        if win_pct >= 70:
                            avg_rating = 5
                        elif win_pct >= 50:
                            avg_rating = 4
                        elif win_pct >= 30:
                            avg_rating = 3
                        elif win_pct >= 15:
                            avg_rating = 2
                        else:
                            avg_rating = 1
                        
                        game_history.append({
                            "bga_game_id": game_stat.get('bga_game_id'),
                            "game_name": game_stat.get('game_name'),
                            "play_date": placeholder_date,  # Required field
                            "rating": avg_rating,  # Calculated from win percentage
                            "games_played": game_stat.get('games_played', 0),
                            "victories": game_stat.get('victories', 0),
                            "win_percentage": game_stat.get('win_percentage', 0),
                            "elo_rating": game_stat.get('elo_rating'),
                            "rank_level": game_stat.get('rank_level'),
                            "notes": f"Aggregate stats: {game_stat.get('games_played', 0)} games, {game_stat.get('victories', 0)} wins ({game_stat.get('win_percentage', 0)}%)"
                        })
            else:
                # Fallback to old JSON file method
                stats_dir = self.raw_data_path / "player-stats" / player_name
                stats_file = None
                
                if stats_dir.exists():
                    # Find JSON file (may have different naming patterns)
                    json_files = list(stats_dir.glob("*.json"))
                    if json_files:
                        stats_file = json_files[0]  # Take the first JSON file found
                
                if stats_file and stats_file.exists():
                    game_history = self.extract_game_history(stats_file, bga_username)
            
            return {
                "username": bga_username,  # Use actual BGA username
                "display_name": display_name,
                "avatar_url": avatar_url,
                "game_history": game_history
            }
            
        except Exception as e:
            print(f"Error extracting player data for {player_name}: {e}")
            return None
    
    def extract_game_history(self, stats_file: Path, player_username: str) -> List[Dict]:
        """Extract game history from player stats JSON."""
        try:
            with open(stats_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'data' not in data or 'tables' not in data['data']:
                return []
            
            history = []
            for table in data['data']['tables']:
                try:
                    # Convert timestamp to datetime
                    play_date = datetime.fromtimestamp(int(table['start']))
                    
                    # Extract player's score and rank
                    player_names = table['player_names'].split(',')
                    scores = table['scores'].split(',')
                    ranks = table['ranks'].split(',')
                    
                    # Find this player's position in the results
                    player_index = None
                    for i, name in enumerate(player_names):
                        if name == player_username:  # Match actual BGA username
                            player_index = i
                            break
                    
                    if player_index is not None:
                        score = int(scores[player_index]) if player_index < len(scores) else 0
                        rank = int(ranks[player_index]) if player_index < len(ranks) else len(player_names)
                        
                        # Calculate a simple rating based on rank (1st = 5, 2nd = 4, etc.)
                        rating = max(1, 6 - rank)
                        
                        history.append({
                            "bga_game_id": table['game_id'],
                            "game_name": table['game_name'],
                            "play_date": play_date,
                            "score": score,
                            "rank": rank,
                            "rating": rating,
                            "table_id": table['table_id'],
                            "elo_after": table.get('elo_after'),
                            "notes": f"Rank {rank} of {len(player_names)} players"
                        })
                        
                except (ValueError, KeyError, IndexError) as e:
                    print(f"Error processing game record: {e}")
                    continue
            
            print(f"Extracted {len(history)} game records from {stats_file.name}")
            return history
            
        except Exception as e:
            print(f"Error extracting game history from {stats_file}: {e}")
            return []
    
    async def import_games(self, session: AsyncSession, games_data: List[Dict]) -> int:
        """Import games data into database."""
        imported_count = 0
        
        for game_data in games_data:
            try:
                # Check if game already exists
                result = await session.execute(
                    select(Game).where(Game.bga_id == game_data["bga_id"])
                )
                existing_game = result.scalar_one_or_none()
                
                if not existing_game:
                    game = Game(
                        name=game_data["name"],
                        bga_id=game_data["bga_id"],
                        min_players=game_data["min_players"],
                        max_players=game_data["max_players"],
                        average_play_time=game_data["average_play_time"],
                        complexity_rating=game_data["complexity_rating"]
                    )
                    session.add(game)
                    imported_count += 1
                    
            except Exception as e:
                print(f"Error importing game {game_data['name']}: {e}")
        
        return imported_count
    
    async def import_player_data(self, session: AsyncSession, player_data: Dict) -> None:
        """Import player data into database."""
        try:
            # Check if player already exists
            result = await session.execute(
                select(Player).where(Player.username == player_data["username"])
            )
            existing_player = result.scalar_one_or_none()
            
            if not existing_player:
                player = Player(
                    username=player_data["username"],
                    display_name=player_data["display_name"],
                    avatar_url=player_data["avatar_url"]
                )
                session.add(player)
                
        except Exception as e:
            print(f"Error importing player {player_data['username']}: {e}")
    
    async def import_player_game_history(
        self, session: AsyncSession, player_data: Dict
    ) -> int:
        """Import player game history into database."""
        imported_count = 0
        
        # Get player from database
        result = await session.execute(
            select(Player).where(Player.username == player_data["username"])
        )
        player = result.scalar_one_or_none()
        
        if not player:
            print(f"Player {player_data['username']} not found in database")
            return 0
        
        for history_item in player_data["game_history"]:
            try:
                # Find the game by BGA ID
                result = await session.execute(
                    select(Game).where(Game.bga_id == history_item["bga_game_id"])
                )
                game = result.scalar_one_or_none()
                
                if game:
                    # Check if this game history already exists
                    # For aggregate stats, check by player and game only (not date)
                    existing_result = await session.execute(
                        select(PlayerGameHistory).where(
                            PlayerGameHistory.player_id == player.id,
                            PlayerGameHistory.game_id == game.id
                        )
                    )
                    
                    if not existing_result.scalar_one_or_none():
                        game_history = PlayerGameHistory(
                            player_id=player.id,
                            game_id=game.id,
                            play_date=history_item["play_date"],
                            rating=history_item["rating"],
                            notes=history_item["notes"]
                        )
                        session.add(game_history)
                        imported_count += 1
                        
            except Exception as e:
                print(f"Error importing game history for {player_data['username']}: {e}")
        
        return imported_count


async def process_bga_data(data_root_path: str = "data") -> Dict[str, int]:
    """Main function to process BGA data."""
    processor = BGADataProcessor(Path(data_root_path))
    
    async for session in get_db():
        try:
            results = await processor.process_all_data(session)
            return results
        finally:
            await session.close()
    
    # Fallback return (should not reach here in normal operation)
    return {"games_processed": 0, "players_processed": 0, "game_history_processed": 0, "errors": 1} 