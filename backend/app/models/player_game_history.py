"""Player game history model module."""
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, Float, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.game import Game
from app.models.player import Player


class PlayerGameHistory(Base):
    """Player game history model for tracking played games."""
    
    __tablename__ = "player_game_history"
    
    # Foreign keys
    player_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    game_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("games.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Play details
    play_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
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
    player: Mapped[Player] = relationship(
        back_populates="game_history",
    )
    game: Mapped[Game] = relationship(
        back_populates="player_history",
    ) 