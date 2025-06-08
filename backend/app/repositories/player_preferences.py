"""Player preferences repository module."""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.player_preferences import PlayerPreferences
from app.models.game_category import GameCategory
from app.schemas.player_preferences import PlayerPreferencesCreate, PlayerPreferencesUpdate


class PlayerPreferencesRepository:
    """Repository for player preferences-related database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_player_id(self, player_id: UUID) -> Optional[PlayerPreferences]:
        """Get player preferences by player ID with relationships loaded."""
        result = await self.session.execute(
            select(PlayerPreferences)
            .options(selectinload(PlayerPreferences.preferred_categories))
            .where(PlayerPreferences.player_id == player_id)
        )
        return result.scalar_one_or_none()

    async def create(self, preferences_data: PlayerPreferencesCreate) -> PlayerPreferences:
        """Create new player preferences."""
        # Create preferences without relationships first
        preferences_dict = preferences_data.model_dump(exclude={"preferred_category_ids"})
        preferences = PlayerPreferences(**preferences_dict)
        
        # Handle preferred categories
        if preferences_data.preferred_category_ids:
            categories = await self.session.execute(
                select(GameCategory).where(
                    GameCategory.id.in_(preferences_data.preferred_category_ids)
                )
            )
            preferences.preferred_categories = list(categories.scalars().all())
        
        self.session.add(preferences)
        await self.session.commit()
        await self.session.refresh(preferences, ["preferred_categories"])
        return preferences

    async def update(
        self, preferences: PlayerPreferences, preferences_data: PlayerPreferencesUpdate
    ) -> PlayerPreferences:
        """Update player preferences."""
        # Update scalar fields
        for field, value in preferences_data.model_dump(
            exclude_unset=True, exclude={"preferred_category_ids"}
        ).items():
            setattr(preferences, field, value)
        
        # Handle preferred categories if provided
        if preferences_data.preferred_category_ids is not None:
            if preferences_data.preferred_category_ids:
                categories = await self.session.execute(
                    select(GameCategory).where(
                        GameCategory.id.in_(preferences_data.preferred_category_ids)
                    )
                )
                preferences.preferred_categories = list(categories.scalars().all())
            else:
                # Clear all categories if empty list provided
                preferences.preferred_categories = []
        
        await self.session.commit()
        await self.session.refresh(preferences, ["preferred_categories"])
        return preferences

    async def delete(self, preferences: PlayerPreferences) -> None:
        """Delete player preferences."""
        await self.session.delete(preferences)
        await self.session.commit() 