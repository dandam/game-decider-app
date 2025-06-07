"""Player preferences model module."""
from typing import List, Optional

from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.associations import player_preferred_categories


class PlayerPreferences(Base):
    """Player preferences model for storing game preferences."""
    
    __tablename__ = "player_preferences"
    
    # Foreign key to player
    player_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    
    # Time preferences
    minimum_play_time: Mapped[Optional[int]] = mapped_column(
        Integer,  # In minutes
        nullable=True,
    )
    maximum_play_time: Mapped[Optional[int]] = mapped_column(
        Integer,  # In minutes
        nullable=True,
    )
    
    # Player count preferences
    preferred_player_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Complexity preferences
    preferred_complexity_min: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    preferred_complexity_max: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    # Relationships
    player: Mapped["Player"] = relationship(
        "Player",
        back_populates="preferences",
    )
    preferred_categories: Mapped[List["GameCategory"]] = relationship(
        "GameCategory",
        secondary=player_preferred_categories,
        back_populates="preferring_players",
    ) 