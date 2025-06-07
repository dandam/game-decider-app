"""Player game history model module."""
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PlayerGameHistory(Base):
    """Player game history model for tracking played games."""
    
    __tablename__ = "player_game_history"
    
    # Foreign keys
    player_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        nullable=False,
    )
    game_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("games.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    # Play information
    play_date: Mapped[datetime] = mapped_column(
        nullable=False,
    )
    rating: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(length=500),
        nullable=True,
    )
    
    # Relationships
    player: Mapped["Player"] = relationship(
        "Player",
        back_populates="game_history",
    )
    game: Mapped["Game"] = relationship(
        "Game",
        back_populates="player_history",
    ) 