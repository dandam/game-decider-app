"""Game schemas module."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GameCategoryBase(BaseModel):
    """Base schema for GameCategory model."""
    
    name: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=200)


class GameCategoryCreate(GameCategoryBase):
    """Schema for creating a new game category."""
    pass


class GameCategoryUpdate(BaseModel):
    """Schema for updating a game category."""
    
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, min_length=10, max_length=200)


class GameCategoryInDB(GameCategoryBase):
    """Schema for game category as stored in database."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GameTagBase(BaseModel):
    """Base schema for GameTag model."""
    
    name: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=200)


class GameTagCreate(GameTagBase):
    """Schema for creating a new game tag."""
    pass


class GameTagUpdate(BaseModel):
    """Schema for updating a game tag."""
    
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, min_length=10, max_length=200)


class GameTagInDB(GameTagBase):
    """Schema for game tag as stored in database."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GameBase(BaseModel):
    """Base schema for Game model."""
    
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    min_players: int = Field(..., ge=1, le=10)
    max_players: int = Field(..., ge=1, le=10)
    average_play_time: int = Field(..., ge=5, le=240)  # in minutes
    complexity_rating: float = Field(..., ge=1.0, le=5.0)

    @field_validator("max_players")
    def max_players_must_be_greater_than_min(cls, v, values):
        """Validate that max_players is greater than or equal to min_players."""
        if "min_players" in values.data and v < values.data["min_players"]:
            raise ValueError("max_players must be greater than or equal to min_players")
        return v


class GameCreate(GameBase):
    """Schema for creating a new game."""
    
    category_ids: List[UUID] = Field(default_factory=list)
    tag_ids: List[UUID] = Field(default_factory=list)


class GameUpdate(BaseModel):
    """Schema for updating a game."""
    
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    min_players: Optional[int] = Field(None, ge=1, le=10)
    max_players: Optional[int] = Field(None, ge=1, le=10)
    average_play_time: Optional[int] = Field(None, ge=5, le=240)
    complexity_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    category_ids: Optional[List[UUID]] = None
    tag_ids: Optional[List[UUID]] = None


class GameInDB(GameBase):
    """Schema for game as stored in database."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime
    categories: List[GameCategoryInDB]
    tags: List[GameTagInDB]

    model_config = ConfigDict(from_attributes=True)


# Response schemas
class GameCategoryResponse(GameCategoryInDB):
    """Schema for game category response."""
    pass


class GameTagResponse(GameTagInDB):
    """Schema for game tag response."""
    pass


class GameResponse(GameInDB):
    """Schema for game response."""
    pass 