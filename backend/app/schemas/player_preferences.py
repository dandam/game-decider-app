"""Player preferences schemas module."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.game import GameCategoryResponse


class PlayerPreferencesBase(BaseModel):
    """Base schema for PlayerPreferences model."""
    
    minimum_play_time: Optional[int] = Field(None, ge=5, le=240)
    maximum_play_time: Optional[int] = Field(None, ge=5, le=240)
    preferred_player_count: Optional[int] = Field(None, ge=1, le=10)
    preferred_complexity_min: Optional[float] = Field(None, ge=1.0, le=5.0)
    preferred_complexity_max: Optional[float] = Field(None, ge=1.0, le=5.0)

    @field_validator("maximum_play_time")
    def max_time_must_be_greater_than_min(cls, v, values):
        """Validate that maximum_play_time is greater than minimum_play_time."""
        if (
            v is not None
            and "minimum_play_time" in values.data
            and values.data["minimum_play_time"] is not None
            and v < values.data["minimum_play_time"]
        ):
            raise ValueError("maximum_play_time must be greater than minimum_play_time")
        return v

    @field_validator("preferred_complexity_max")
    def max_complexity_must_be_greater_than_min(cls, v, values):
        """Validate that preferred_complexity_max is greater than preferred_complexity_min."""
        if (
            v is not None
            and "preferred_complexity_min" in values.data
            and values.data["preferred_complexity_min"] is not None
            and v < values.data["preferred_complexity_min"]
        ):
            raise ValueError(
                "preferred_complexity_max must be greater than preferred_complexity_min"
            )
        return v


class PlayerPreferencesCreate(PlayerPreferencesBase):
    """Schema for creating player preferences."""
    
    player_id: UUID
    preferred_category_ids: List[UUID] = Field(default_factory=list)


class PlayerPreferencesUpdate(PlayerPreferencesBase):
    """Schema for updating player preferences."""
    
    preferred_category_ids: Optional[List[UUID]] = None


class PlayerPreferencesInDB(PlayerPreferencesBase):
    """Schema for player preferences as stored in database."""
    
    id: UUID
    player_id: UUID
    created_at: datetime
    updated_at: datetime
    preferred_categories: List[GameCategoryResponse]

    model_config = ConfigDict(from_attributes=True)


class PlayerPreferencesResponse(PlayerPreferencesInDB):
    """Schema for player preferences response."""
    pass 