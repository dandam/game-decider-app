"""Game API endpoints."""
from typing import List, Optional, Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.game import GameRepository
from app.repositories.player_preferences import PlayerPreferencesRepository
from app.schemas.game import GameCreate, GameResponse, GameUpdate
from app.schemas.compatibility import CompatibilityResponse
from app.services.compatibility import CompatibilityService

router = APIRouter()


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