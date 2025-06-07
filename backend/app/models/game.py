"""Game model module."""
from typing import List, Optional

from sqlalchemy import Integer, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.associations import games_categories, games_tags
from app.models.player_game_history import PlayerGameHistory


class Game(Base):
    """Game model for storing board game information."""
    
    __tablename__ = "games"
    
    # Basic game information
    name: Mapped[str] = mapped_column(
        String(length=200),
        nullable=False,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    min_players: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    max_players: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    average_play_time: Mapped[int] = mapped_column(
        Integer,  # In minutes
        nullable=False,
    )
    complexity_rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    
    # External identifiers
    bga_id: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        unique=True,
        nullable=True,
        index=True,
    )
    
    # Relationships
    categories: Mapped[List["GameCategory"]] = relationship(
        "GameCategory",
        secondary=games_categories,
        back_populates="games",
    )
    tags: Mapped[List["GameTag"]] = relationship(
        "GameTag",
        secondary=games_tags,
        back_populates="games",
    )
    player_history: Mapped[List["PlayerGameHistory"]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
    ) 