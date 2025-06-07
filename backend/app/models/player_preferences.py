"""Player preferences model module."""
from typing import List, Optional

from sqlalchemy import ForeignKey, Integer, Float, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.player import Player
from app.models.game_category import GameCategory


# Association table for many-to-many relationship between player preferences and game categories
player_preferred_categories = Table(
    "player_preferred_categories",
    Base.metadata,
    Column(
        "preference_id",
        UUID(as_uuid=True),
        ForeignKey("player_preferences.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("game_categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class PlayerPreferences(Base):
    """Player preferences model for storing user game preferences."""
    
    __tablename__ = "player_preferences"
    
    # Foreign key to player
    player_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        unique=True,  # Ensures 1:1 relationship
        nullable=False,
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
    
    # Player count preference
    preferred_player_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    
    # Complexity preference
    preferred_complexity_min: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    preferred_complexity_max: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    
    # Relationship to player
    player: Mapped[Player] = relationship(
        back_populates="preferences",
        single_parent=True,  # Ensures 1:1 relationship
    )
    
    # Relationship to preferred categories
    preferred_categories: Mapped[List[GameCategory]] = relationship(
        secondary=player_preferred_categories,
        back_populates="preferring_players",
    ) 