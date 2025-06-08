"""Processor for BoardGameArena multi-player session data."""
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.game_session import GameSession
from app.models.player import Player


class BGASessionProcessor:
    """Processes BoardGameArena session data for multi-player games."""
    
    def __init__(self, data_root: Path):
        """Initialize processor with data directory path."""
        self.data_root = data_root
        self.raw_data_path = data_root / "raw"
    
    async def process_session_data(self, session: AsyncSession, player_name: str) -> int:
        """Process session data for a specific player.
        
        Args:
            session: Database session
            player_name: Name of the player whose session data to process
            
        Returns:
            Number of sessions processed
        """
        stats_dir = self.raw_data_path / "player-stats" / player_name
        
        if not stats_dir.exists():
            print(f"No stats directory found for {player_name}")
            return 0
        
        # Look for JSON files containing session data
        json_files = list(stats_dir.glob("*.json"))
        if not json_files:
            print(f"No JSON files found for {player_name}")
            return 0
        
        sessions_processed = 0
        
        for json_file in json_files:
            try:
                sessions_count = await self._process_json_file(session, json_file)
                sessions_processed += sessions_count
            except Exception as e:
                print(f"Error processing {json_file}: {e}")
        
        return sessions_processed
    
    async def _process_json_file(self, session: AsyncSession, json_file: Path) -> int:
        """Process a single JSON file containing session data.
        
        Args:
            session: Database session
            json_file: Path to the JSON file
            
        Returns:
            Number of sessions processed from this file
        """
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'data' not in data or 'tables' not in data['data']:
                print(f"Invalid data structure in {json_file}")
                return 0
            
            sessions_processed = 0
            
            for table_data in data['data']['tables']:
                try:
                    # Check if this is a multi-player session with our core players
                    if await self._is_core_player_session(table_data):
                        await self._create_game_session(session, table_data)
                        sessions_processed += 1
                except Exception as e:
                    print(f"Error processing table {table_data.get('table_id', 'unknown')}: {e}")
                    continue
            
            return sessions_processed
            
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
            return 0
    
    async def _is_core_player_session(self, table_data: Dict) -> bool:
        """Check if this session involves our core players.
        
        Args:
            table_data: Table data from BGA JSON
            
        Returns:
            True if this session involves multiple core players
        """
        core_players = {"dandam", "superoogie", "permagoof", "gundlach"}
        
        player_names_str = table_data.get('player_names', '')
        if not player_names_str:
            return False
        
        session_players = set(player_names_str.split(','))
        
        # Check if at least 2 core players are in this session
        core_players_in_session = session_players.intersection(core_players)
        return len(core_players_in_session) >= 2
    
    async def _create_game_session(self, session: AsyncSession, table_data: Dict) -> None:
        """Create a GameSession from BGA table data.
        
        Args:
            session: Database session
            table_data: Table data from BGA JSON
        """
        # Check if session already exists
        table_id = table_data.get('table_id')
        if not table_id:
            return
        
        existing = await session.execute(
            select(GameSession).where(GameSession.bga_table_id == str(table_id))
        )
        if existing.scalar_one_or_none():
            return  # Session already exists
        
        # Parse player data
        player_names = table_data.get('player_names', '').split(',')
        scores = [int(s) for s in table_data.get('scores', '').split(',')]
        ranks = [int(r) for r in table_data.get('ranks', '').split(',')]
        
        if not (player_names and scores and ranks):
            return
        
        # Sort by ranking (winner first)
        player_data = list(zip(player_names, scores, ranks))
        player_data.sort(key=lambda x: x[2])  # Sort by rank
        
        sorted_players = [p[0] for p in player_data]
        sorted_scores = [p[1] for p in player_data]
        sorted_rankings = [p[2] for p in player_data]
        
        # Create game session
        game_session = GameSession(
            bga_table_id=str(table_id),
            bga_game_id=str(table_data.get('game_id', '')),
            game_name=table_data.get('game_name', ''),
            play_date=datetime.fromtimestamp(int(table_data.get('start', 0))),
            player_ids=sorted_players,  # Using usernames as IDs for now
            player_names=sorted_players,
            scores=sorted_scores,
            rankings=sorted_rankings,
            bga_metadata={
                'original_data': table_data,
                'processed_at': datetime.utcnow().isoformat()
            }
        )
        
        session.add(game_session)


async def process_all_session_data(data_root_path: str = "data") -> Dict[str, int]:
    """Process session data for all core players.
    
    Args:
        data_root_path: Path to the data directory
        
    Returns:
        Dictionary with processing results
    """
    from app.core.database import get_db
    
    processor = BGASessionProcessor(Path(data_root_path))
    core_players = ["dandam", "superoogie", "permagoof", "gundlach"]
    
    results = {
        "sessions_processed": 0,
        "players_processed": 0,
        "errors": 0
    }
    
    async for db_session in get_db():
        try:
            for player_name in core_players:
                try:
                    sessions_count = await processor.process_session_data(db_session, player_name)
                    results["sessions_processed"] += sessions_count
                    results["players_processed"] += 1
                    print(f"Processed {sessions_count} sessions for {player_name}")
                except Exception as e:
                    print(f"Error processing sessions for {player_name}: {e}")
                    results["errors"] += 1
            
            await db_session.commit()
            break
            
        except Exception as e:
            print(f"Database error: {e}")
            await db_session.rollback()
            results["errors"] += 1
            break
        finally:
            await db_session.close()
    
    return results 