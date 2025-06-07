"""Game category model module."""
from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.associations import games_categories, player_preferred_categories


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
    games: Mapped[List["Game"]] = relationship(
        "Game",
        secondary=games_categories,
        back_populates="categories",
    )
    
    # Relationship to player preferences
    preferring_players: Mapped[List["PlayerPreferences"]] = relationship(
        "PlayerPreferences",
        secondary=player_preferred_categories,
        back_populates="preferred_categories",
    ) 