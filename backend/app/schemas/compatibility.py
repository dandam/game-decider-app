"""Game-player compatibility schemas module."""
from typing import Dict, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class CompatibilityResponse(BaseModel):
    """Schema for game-player compatibility response."""
    
    game_id: UUID
    player_id: UUID
    compatibility_score: float = Field(..., ge=0.0, le=1.0, description="Compatibility score from 0.0 to 1.0")
    recommendation: Literal["recommended", "not_recommended"] = Field(..., description="Overall recommendation")
    details: Dict[str, str] = Field(..., description="Detailed compatibility breakdown")
    
    class Config:
        json_schema_extra = {
            "example": {
                "game_id": "123e4567-e89b-12d3-a456-426614174000",
                "player_id": "123e4567-e89b-12d3-a456-426614174001",
                "compatibility_score": 0.75,
                "recommendation": "recommended",
                "details": {
                    "player_count": "compatible",
                    "play_time": "compatible",
                    "complexity": "compatible",
                    "categories": "incompatible"
                }
            }
        } 