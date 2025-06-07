"""Player repository module."""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerUpdate


class PlayerRepository:
    """Repository for player-related database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, player_data: PlayerCreate) -> Player:
        """Create a new player."""
        player = Player(**player_data.model_dump())
        self.session.add(player)
        await self.session.commit()
        await self.session.refresh(player)
        return player

    async def get_by_id(self, player_id: UUID) -> Optional[Player]:
        """Get a player by ID."""
        result = await self.session.execute(
            select(Player).where(Player.id == player_id)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[Player]:
        """Get a player by username."""
        result = await self.session.execute(
            select(Player).where(Player.username == username)
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Player]:
        """Get all players with pagination."""
        result = await self.session.execute(
            select(Player).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def update(
        self, player: Player, player_data: PlayerUpdate
    ) -> Player:
        """Update a player."""
        for field, value in player_data.model_dump(exclude_unset=True).items():
            setattr(player, field, value)
        await self.session.commit()
        await self.session.refresh(player)
        return player

    async def delete(self, player: Player) -> None:
        """Delete a player."""
        await self.session.delete(player)
        await self.session.commit() 