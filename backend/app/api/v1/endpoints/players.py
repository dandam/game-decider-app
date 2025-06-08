"""Player API endpoints."""
from typing import List, Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.player import PlayerRepository
from app.repositories.player_preferences import PlayerPreferencesRepository
from app.schemas.player import PlayerCreate, PlayerResponse, PlayerUpdate
from app.schemas.player_preferences import (
    PlayerPreferencesCreate,
    PlayerPreferencesResponse,
    PlayerPreferencesUpdate,
)

router = APIRouter()


@router.post(
    "",
    response_model=PlayerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_player(
    player_data: PlayerCreate,
    session: AsyncSession = Depends(get_db),
) -> PlayerResponse:
    """Create a new player."""
    repo = PlayerRepository(session)
    
    # Check if username is already taken
    if await repo.get_by_username(player_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    player = await repo.create(player_data)
    return PlayerResponse.model_validate(player)


@router.get(
    "",
    response_model=List[PlayerResponse],
)
async def get_players(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
) -> Sequence[PlayerResponse]:
    """Get all players."""
    repo = PlayerRepository(session)
    players = await repo.get_all(skip=skip, limit=limit)
    return [PlayerResponse.model_validate(p) for p in players]


@router.get(
    "/{player_id}",
    response_model=PlayerResponse,
)
async def get_player(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> PlayerResponse:
    """Get a specific player by ID."""
    repo = PlayerRepository(session)
    player = await repo.get_by_id(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    return PlayerResponse.model_validate(player)


@router.put(
    "/{player_id}",
    response_model=PlayerResponse,
)
async def update_player(
    player_id: UUID,
    player_data: PlayerUpdate,
    session: AsyncSession = Depends(get_db),
) -> PlayerResponse:
    """Update a player."""
    repo = PlayerRepository(session)
    player = await repo.get_by_id(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    updated_player = await repo.update(player, player_data)
    return PlayerResponse.model_validate(updated_player)


@router.delete(
    "/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_player(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> None:
    """Delete a player."""
    repo = PlayerRepository(session)
    player = await repo.get_by_id(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    await repo.delete(player)


@router.get(
    "/{player_id}/preferences",
    response_model=PlayerPreferencesResponse,
)
async def get_player_preferences(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> PlayerPreferencesResponse:
    """Get player preferences by player ID."""
    # First verify player exists
    player_repo = PlayerRepository(session)
    player = await player_repo.get_by_id(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    # Get preferences
    preferences_repo = PlayerPreferencesRepository(session)
    preferences = await preferences_repo.get_by_player_id(player_id)
    
    if not preferences:
        # Create default empty preferences if none exist
        default_preferences = PlayerPreferencesCreate(
            player_id=player_id,
            preferred_category_ids=[],
        )
        preferences = await preferences_repo.create(default_preferences)
    
    return PlayerPreferencesResponse.model_validate(preferences)


@router.put(
    "/{player_id}/preferences",
    response_model=PlayerPreferencesResponse,
)
async def update_player_preferences(
    player_id: UUID,
    preferences_data: PlayerPreferencesUpdate,
    session: AsyncSession = Depends(get_db),
) -> PlayerPreferencesResponse:
    """Update player preferences."""
    # First verify player exists
    player_repo = PlayerRepository(session)
    player = await player_repo.get_by_id(player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    preferences_repo = PlayerPreferencesRepository(session)
    preferences = await preferences_repo.get_by_player_id(player_id)
    
    if not preferences:
        # Create new preferences if none exist
        create_data = PlayerPreferencesCreate(
            player_id=player_id,
            **preferences_data.model_dump(exclude_unset=True),
        )
        preferences = await preferences_repo.create(create_data)
    else:
        # Update existing preferences
        preferences = await preferences_repo.update(preferences, preferences_data)
    
    return PlayerPreferencesResponse.model_validate(preferences) 