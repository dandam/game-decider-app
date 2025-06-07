"""Player schemas module."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PlayerBase(BaseModel):
    """Base schema for Player model."""
    
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=255)


class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""
    pass


class PlayerUpdate(BaseModel):
    """Schema for updating a player."""
    
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=255)


class PlayerInDB(PlayerBase):
    """Schema for player as stored in database."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlayerResponse(PlayerInDB):
    """Schema for player response."""
    pass 