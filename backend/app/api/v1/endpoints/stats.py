"""Statistics API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.game import Game
from app.models.player import Player
from app.models.player_game_history import PlayerGameHistory
from app.models.player_preferences import PlayerPreferences

router = APIRouter()


@router.get("/db")
async def get_database_stats(
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Get database statistics."""
    # Count games
    games_result = await session.execute(select(func.count(Game.id)))
    games_count = games_result.scalar() or 0
    
    # Count players
    players_result = await session.execute(select(func.count(Player.id)))
    players_count = players_result.scalar() or 0
    
    # Count game history records
    history_result = await session.execute(select(func.count(PlayerGameHistory.id)))
    history_count = history_result.scalar() or 0
    
    # Count player preferences
    preferences_result = await session.execute(select(func.count(PlayerPreferences.id)))
    preferences_count = preferences_result.scalar() or 0
    
    return {
        "games": games_count,
        "players": players_count,
        "game_history": history_count,
        "player_preferences": preferences_count
    } 