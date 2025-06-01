"""Player model module."""
from typing import Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


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
        String(length=255),
        nullable=True,
    )
    
    # Relationships will be added as we implement other models
    # preferences: Mapped["PlayerPreferences"] = relationship(back_populates="player")
    # game_history: Mapped[List["PlayerGameHistory"]] = relationship(back_populates="player") 