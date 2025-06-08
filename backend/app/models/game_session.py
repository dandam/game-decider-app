"""Game session model for tracking multi-player games between our core players."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class GameSession(Base):
    """Represents a multi-player game session between our core players.
    
    This tracks actual games played between our four main players,
    including scores, rankings, and other session metadata.
    """
    __tablename__ = "game_sessions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    
    # BGA-specific identifiers
    bga_table_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    bga_game_id: Mapped[str] = mapped_column(String(50), index=True)
    
    # Game information
    game_name: Mapped[str] = mapped_column(String(200))
    play_date: Mapped[datetime] = mapped_column(DateTime)
    
    # Player data (stored as JSON arrays in ranking order: winner first, loser last)
    player_ids: Mapped[List[str]] = mapped_column(JSON)  # BGA player IDs in ranking order
    player_names: Mapped[List[str]] = mapped_column(JSON)  # BGA usernames in ranking order
    scores: Mapped[List[int]] = mapped_column(JSON)  # Scores in ranking order
    rankings: Mapped[List[int]] = mapped_column(JSON)  # Final rankings (1st, 2nd, etc.)
    
    # Optional metadata
    game_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Additional BGA metadata (stored as JSON for flexibility)
    bga_metadata: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<GameSession(id={self.id}, game={self.game_name}, players={len(self.player_names)}, date={self.play_date})>"
    
    @property
    def winner(self) -> str:
        """Get the winner's username (first in ranking order)."""
        return self.player_names[0] if self.player_names else ""
    
    @property
    def player_count(self) -> int:
        """Get the number of players in this session."""
        return len(self.player_names) if self.player_names else 0
    
    def get_player_rank(self, player_name: str) -> Optional[int]:
        """Get the ranking (1-based) for a specific player."""
        try:
            index = self.player_names.index(player_name)
            return self.rankings[index]
        except (ValueError, IndexError):
            return None
    
    def get_player_score(self, player_name: str) -> Optional[int]:
        """Get the score for a specific player."""
        try:
            index = self.player_names.index(player_name)
            return self.scores[index]
        except (ValueError, IndexError):
            return None 