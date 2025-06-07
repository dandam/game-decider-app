"""Player game history schemas module."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.game import GameResponse


class PlayerGameHistoryBase(BaseModel):
    """Base schema for PlayerGameHistory model."""
    
    play_date: datetime
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    notes: Optional[str] = Field(None, max_length=500)


class PlayerGameHistoryCreate(PlayerGameHistoryBase):
    """Schema for creating a game history entry."""
    
    player_id: UUID
    game_id: UUID


class PlayerGameHistoryUpdate(BaseModel):
    """Schema for updating a game history entry."""
    
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    notes: Optional[str] = Field(None, max_length=500)


class PlayerGameHistoryInDB(PlayerGameHistoryBase):
    """Schema for game history as stored in database."""
    
    id: UUID
    player_id: UUID
    game_id: UUID
    created_at: datetime
    updated_at: datetime
    game: GameResponse

    model_config = ConfigDict(from_attributes=True)


class PlayerGameHistoryResponse(PlayerGameHistoryInDB):
    """Schema for game history response."""
    pass 