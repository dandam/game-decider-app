"""Game API endpoints."""
from typing import List, Optional, Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct

from app.core.database import get_db
from app.repositories.game import GameRepository
from app.repositories.player_preferences import PlayerPreferencesRepository
from app.schemas.game import GameCreate, GameResponse, GameUpdate
from app.schemas.compatibility import CompatibilityResponse
from app.services.compatibility import CompatibilityService
from app.models.player_game_history import PlayerGameHistory
from app.models.game import Game
from app.models.player import Player

router = APIRouter()

# Our 4 real BGA players for curation
REAL_PLAYERS = ["dandam", "superoogie", "permagoof", "gundlach"]


@router.post(
    "",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_game(
    game_data: GameCreate,
    session: AsyncSession = Depends(get_db),
) -> GameResponse:
    """Create a new game (admin only)."""
    repo = GameRepository(session)
    
    # Check if game with same name already exists
    existing_games = await repo.search_by_name(game_data.name, limit=1)
    if existing_games and existing_games[0].name.lower() == game_data.name.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game with this name already exists",
        )
    
    game = await repo.create(game_data)
    return GameResponse.model_validate(game)


@router.get(
    "",
    response_model=List[GameResponse],
)
async def get_games(
    skip: int = Query(0, ge=0, description="Number of games to skip"),
    limit: int = Query(100, ge=1, le=500, description="Number of games to return"),
    search: Optional[str] = Query(None, description="Search in game name and description"),
    min_players: Optional[int] = Query(None, ge=1, le=10, description="Minimum player count"),
    max_players: Optional[int] = Query(None, ge=1, le=10, description="Maximum player count"),
    min_play_time: Optional[int] = Query(None, ge=1, description="Minimum play time in minutes"),
    max_play_time: Optional[int] = Query(None, ge=1, description="Maximum play time in minutes"),
    min_complexity: Optional[float] = Query(None, ge=1.0, le=5.0, description="Minimum complexity rating"),
    max_complexity: Optional[float] = Query(None, ge=1.0, le=5.0, description="Maximum complexity rating"),
    category_ids: Optional[List[UUID]] = Query(None, description="Filter by category IDs"),
    tag_ids: Optional[List[UUID]] = Query(None, description="Filter by tag IDs"),
    category_filter_mode: str = Query("any", regex="^(any|all)$", description="Category filter mode: 'any' or 'all'"),
    tag_filter_mode: str = Query("any", regex="^(any|all)$", description="Tag filter mode: 'any' or 'all'"),
    session: AsyncSession = Depends(get_db),
) -> Sequence[GameResponse]:
    """Get games with advanced filtering and search."""
    repo = GameRepository(session)
    
    # Validate player count logic
    if min_players is not None and max_players is not None and min_players > max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_players cannot be greater than max_players",
        )
    
    # Validate play time logic
    if min_play_time is not None and max_play_time is not None and min_play_time > max_play_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_play_time cannot be greater than max_play_time",
        )
    
    # Validate complexity logic
    if min_complexity is not None and max_complexity is not None and min_complexity > max_complexity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_complexity cannot be greater than max_complexity",
        )
    
    games = await repo.get_all(
        skip=skip,
        limit=limit,
        search=search,
        min_players=min_players,
        max_players=max_players,
        min_play_time=min_play_time,
        max_play_time=max_play_time,
        min_complexity=min_complexity,
        max_complexity=max_complexity,
        category_ids=category_ids,
        tag_ids=tag_ids,
        category_filter_mode=category_filter_mode,
        tag_filter_mode=tag_filter_mode,
    )
    return [GameResponse.model_validate(game) for game in games]


@router.get(
    "/count",
    response_model=dict,
)
async def get_games_count(
    search: Optional[str] = Query(None, description="Search in game name and description"),
    min_players: Optional[int] = Query(None, ge=1, le=10, description="Minimum player count"),
    max_players: Optional[int] = Query(None, ge=1, le=10, description="Maximum player count"),
    min_play_time: Optional[int] = Query(None, ge=1, description="Minimum play time in minutes"),
    max_play_time: Optional[int] = Query(None, ge=1, description="Maximum play time in minutes"),
    min_complexity: Optional[float] = Query(None, ge=1.0, le=5.0, description="Minimum complexity rating"),
    max_complexity: Optional[float] = Query(None, ge=1.0, le=5.0, description="Maximum complexity rating"),
    category_ids: Optional[List[UUID]] = Query(None, description="Filter by category IDs"),
    tag_ids: Optional[List[UUID]] = Query(None, description="Filter by tag IDs"),
    category_filter_mode: str = Query("any", regex="^(any|all)$", description="Category filter mode: 'any' or 'all'"),
    tag_filter_mode: str = Query("any", regex="^(any|all)$", description="Tag filter mode: 'any' or 'all'"),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Get count of games matching filter criteria."""
    repo = GameRepository(session)
    
    count = await repo.count_filtered(
        search=search,
        min_players=min_players,
        max_players=max_players,
        min_play_time=min_play_time,
        max_play_time=max_play_time,
        min_complexity=min_complexity,
        max_complexity=max_complexity,
        category_ids=category_ids,
        tag_ids=tag_ids,
        category_filter_mode=category_filter_mode,
        tag_filter_mode=tag_filter_mode,
    )
    return {"count": count}


@router.get(
    "/search",
    response_model=List[GameResponse],
)
async def search_games_by_name(
    name: str = Query(..., min_length=1, description="Game name to search for"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    session: AsyncSession = Depends(get_db),
) -> Sequence[GameResponse]:
    """Search games by name (for autocomplete/suggestions)."""
    repo = GameRepository(session)
    games = await repo.search_by_name(name, limit=limit)
    return [GameResponse.model_validate(game) for game in games]


@router.get(
    "/played-games",
    response_model=List[GameResponse],
)
async def get_played_games(
    player_usernames: Optional[List[str]] = Query(None, description="Filter by specific player usernames"),
    skip: int = Query(0, ge=0, description="Number of games to skip"),
    limit: int = Query(100, ge=1, le=500, description="Number of games to return"),
    session: AsyncSession = Depends(get_db),
) -> Sequence[GameResponse]:
    """Get games that have been played by specified players (or our real players by default)."""
    
    # Use provided players or default to our real players
    target_players = player_usernames if player_usernames else REAL_PLAYERS
    
    # First, get game IDs for games played by these players
    id_query = (
        select(Game.id, Game.name)
        .join(PlayerGameHistory, Game.id == PlayerGameHistory.game_id)
        .join(Player, PlayerGameHistory.player_id == Player.id)
        .where(Player.username.in_(target_players))
        .distinct()
        .order_by(Game.name)
        .offset(skip)
        .limit(limit)
    )
    
    id_result = await session.execute(id_query)
    game_rows = id_result.all()
    game_ids = [row[0] for row in game_rows]  # Extract just the IDs
    
    if not game_ids:
        return []
    
    # Use GameRepository to fetch the full games with proper relationship handling
    repo = GameRepository(session)
    games = []
    for game_id in game_ids:
        game = await repo.get_by_id(game_id)
        if game:
            games.append(game)
    
    return [GameResponse.model_validate(game) for game in games]


@router.get(
    "/curated",
    response_model=List[GameResponse],
)
async def get_curated_games(
    skip: int = Query(0, ge=0, description="Number of games to skip"),
    limit: int = Query(150, ge=1, le=500, description="Number of games to return"),
    session: AsyncSession = Depends(get_db),
) -> Sequence[GameResponse]:
    """Get curated game library: played games + similar games for MVP."""
    
    # First, get IDs of games played by our real players (avoid relationship loading issues)
    played_games_id_query = (
        select(Game.id, Game.min_players, Game.max_players, Game.average_play_time, Game.complexity_rating)
        .join(PlayerGameHistory, Game.id == PlayerGameHistory.game_id)
        .join(Player, PlayerGameHistory.player_id == Player.id)
        .where(Player.username.in_(REAL_PLAYERS))
        .distinct()
    )
    
    played_games_result = await session.execute(played_games_id_query)
    played_games_data = played_games_result.all()
    played_game_ids = [row[0] for row in played_games_data]
    
    if not played_games_data:
        # Fallback to regular filtering if no played games found
        repo = GameRepository(session)
        games = await repo.get_all(
            skip=skip,
            limit=limit,
            min_players=2,
            max_players=6,
            min_play_time=30,
            max_play_time=120,
        )
        return [GameResponse.model_validate(game) for game in games]
    
    # Calculate average characteristics of played games for similarity matching
    played_games_stats = {
        'avg_min_players': sum(row[1] for row in played_games_data) / len(played_games_data),
        'avg_max_players': sum(row[2] for row in played_games_data) / len(played_games_data),
        'avg_play_time': sum(row[3] for row in played_games_data) / len(played_games_data),
        'avg_complexity': sum(row[4] for row in played_games_data) / len(played_games_data),
    }
    
    # Find similar games (games not already played but with similar characteristics)
    similar_games_needed = max(0, limit - len(played_games_data))
    similar_game_ids = []
    
    if similar_games_needed > 0:
        # Use broader ranges based on played games characteristics
        min_players_range = max(1, int(played_games_stats['avg_min_players'] - 1))
        max_players_range = min(10, int(played_games_stats['avg_max_players'] + 2))
        min_time_range = max(15, int(played_games_stats['avg_play_time'] * 0.5))
        max_time_range = min(300, int(played_games_stats['avg_play_time'] * 2))
        min_complexity = max(1.0, played_games_stats['avg_complexity'] - 1.0)
        max_complexity = min(5.0, played_games_stats['avg_complexity'] + 1.0)
        
        similar_games_id_query = (
            select(Game.id)
            .where(
                Game.id.not_in(played_game_ids),  # Exclude already played games
                Game.min_players >= min_players_range,
                Game.max_players <= max_players_range,
                Game.average_play_time >= min_time_range,
                Game.average_play_time <= max_time_range,
                Game.complexity_rating >= min_complexity,
                Game.complexity_rating <= max_complexity,
            )
            .order_by(Game.name)
            .limit(similar_games_needed)
        )
        
        similar_games_result = await session.execute(similar_games_id_query)
        similar_game_ids = [row[0] for row in similar_games_result.all()]
    
    # Combine all game IDs and apply pagination
    all_curated_game_ids = played_game_ids + similar_game_ids
    paginated_game_ids = all_curated_game_ids[skip:skip + limit]
    
    # Use GameRepository to fetch the full games with proper relationship handling
    repo = GameRepository(session)
    games = []
    for game_id in paginated_game_ids:
        game = await repo.get_by_id(game_id)
        if game:
            games.append(game)
    
    return [GameResponse.model_validate(game) for game in games]


@router.get(
    "/curated/count",
    response_model=dict,
)
async def get_curated_games_count(
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Get count of curated games."""
    
    # Count played games
    played_count_query = (
        select(func.count(distinct(Game.id)))
        .select_from(Game)
        .join(PlayerGameHistory, Game.id == PlayerGameHistory.game_id)
        .join(Player, PlayerGameHistory.player_id == Player.id)
        .where(Player.username.in_(REAL_PLAYERS))
    )
    
    played_count_result = await session.execute(played_count_query)
    played_count = played_count_result.scalar()
    
    # For MVP, we target ~150 total curated games
    target_total = 150
    similar_count = max(0, target_total - played_count)
    
    return {
        "played_games": played_count,
        "similar_games": similar_count,
        "total_curated": played_count + similar_count
    }


@router.get(
    "/{game_id}",
    response_model=GameResponse,
)
async def get_game(
    game_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> GameResponse:
    """Get a specific game by ID."""
    repo = GameRepository(session)
    game = await repo.get_by_id(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return GameResponse.model_validate(game)


@router.put(
    "/{game_id}",
    response_model=GameResponse,
)
async def update_game(
    game_id: UUID,
    game_data: GameUpdate,
    session: AsyncSession = Depends(get_db),
) -> GameResponse:
    """Update a game (admin only)."""
    repo = GameRepository(session)
    game = await repo.get_by_id(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    # Check if updating name would conflict with existing game
    if game_data.name and game_data.name.lower() != game.name.lower():
        existing_games = await repo.search_by_name(game_data.name, limit=1)
        if existing_games and existing_games[0].name.lower() == game_data.name.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Game with this name already exists",
            )
    
    updated_game = await repo.update(game, game_data)
    return GameResponse.model_validate(updated_game)


@router.delete(
    "/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_game(
    game_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> None:
    """Delete a game (admin only)."""
    repo = GameRepository(session)
    game = await repo.get_by_id(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    await repo.delete(game)


@router.get(
    "/bga/{bga_id}",
    response_model=GameResponse,
)
async def get_game_by_bga_id(
    bga_id: str,
    session: AsyncSession = Depends(get_db),
) -> GameResponse:
    """Get a game by BoardGameArena ID."""
    repo = GameRepository(session)
    game = await repo.get_by_bga_id(bga_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return GameResponse.model_validate(game)


@router.get(
    "/{game_id}/compatibility",
    response_model=CompatibilityResponse,
)
async def get_game_compatibility(
    game_id: UUID,
    player_id: UUID = Query(..., description="Player ID to check compatibility for"),
    session: AsyncSession = Depends(get_db),
) -> CompatibilityResponse:
    """Get game compatibility with player preferences."""
    # Get game
    game_repo = GameRepository(session)
    game = await game_repo.get_by_id(game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    # Get player preferences
    preferences_repo = PlayerPreferencesRepository(session)
    preferences = await preferences_repo.get_by_player_id(player_id)
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player preferences not found",
        )
    
    # Calculate compatibility
    compatibility = CompatibilityService.calculate_compatibility(game, preferences)
    return compatibility 