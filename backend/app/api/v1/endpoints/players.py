"""Player API endpoints."""
from typing import List, Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.player import PlayerRepository
from app.schemas.player import PlayerCreate, PlayerResponse, PlayerUpdate

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