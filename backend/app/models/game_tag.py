"""Game tag model module."""
from typing import List

from sqlalchemy import String, Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.game import Game


# Association table for many-to-many relationship between games and tags
games_tags = Table(
    "games_tags",
    Base.metadata,
    Column(
        "game_id",
        UUID(as_uuid=True),
        ForeignKey("games.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("game_tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class GameTag(Base):
    """Game tag model for flexible game labeling."""
    
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
    games: Mapped[List[Game]] = relationship(
        secondary=games_tags,
        back_populates="tags",
    ) 