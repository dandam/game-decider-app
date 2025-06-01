"""Game model module."""
from typing import Optional

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


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
        nullable=False,
    )
    
    # External identifiers
    bga_id: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        unique=True,
        nullable=True,
        index=True,
    )
    
    # Relationships will be added as we implement categories and tags
    # categories: Mapped[List["GameCategory"]] = relationship(secondary="game_categories", back_populates="games")
    # tags: Mapped[List["GameTag"]] = relationship(secondary="game_tags", back_populates="games") 