"""Player model module."""
from typing import List, Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.player_game_history import PlayerGameHistory
from app.models.player_preferences import PlayerPreferences


class Player(Base):
    """Player model for storing user profile information."""
    
    __tablename__ = "players"
    
    # Basic profile information
    username: Mapped[str] = mapped_column(
        String(length=50),
        unique=True,
        nullable=False,
        index=True,
    )
    display_name: Mapped[str] = mapped_column(
        String(length=100),
        nullable=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(length=200),
        nullable=True,
    )
    
    # Relationships
    preferences: Mapped["PlayerPreferences"] = relationship(
        "PlayerPreferences",
        back_populates="player",
        uselist=False,
        cascade="all, delete-orphan",
    )
    game_history: Mapped[List["PlayerGameHistory"]] = relationship(
        "PlayerGameHistory",
        back_populates="player",
        cascade="all, delete-orphan",
    )

    # preferences: Mapped["PlayerPreferences"] = relationship(back_populates="player")
    # game_history: Mapped[List["PlayerGameHistory"]] = relationship(back_populates="player") 