"""Game tag model module."""
from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.associations import games_tags


class GameTag(Base):
    """Game tag model for labeling games with specific attributes."""
    
    __tablename__ = "game_tags"
    
    # Basic tag information
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
        secondary=games_tags,
        back_populates="tags",
    ) 