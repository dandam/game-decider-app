"""Game category model module."""
from typing import List

from sqlalchemy import String, Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.game import Game
from app.models.player_preferences import PlayerPreferences


# Association table for many-to-many relationship between games and categories
games_categories = Table(
    "games_categories",
    Base.metadata,
    Column(
        "game_id",
        UUID(as_uuid=True),
        ForeignKey("games.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("game_categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class GameCategory(Base):
    """Game category model for organizing games by type."""
    
    __tablename__ = "game_categories"
    
    # Basic category information
    name: Mapped[str] = mapped_column(
        String(length=50),
        unique=True,
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(
        String(length=200),
        nullable=False,
    )
    
    # Relationship to games
    games: Mapped[List[Game]] = relationship(
        secondary=games_categories,
        back_populates="categories",
    )
    
    # Relationship to player preferences
    preferring_players: Mapped[List[PlayerPreferences]] = relationship(
        secondary="player_preferred_categories",
        back_populates="preferred_categories",
    ) 