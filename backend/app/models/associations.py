"""Association tables for many-to-many relationships."""
from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


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

# Association table for many-to-many relationship between player preferences and categories
player_preferred_categories = Table(
    "player_preferred_categories",
    Base.metadata,
    Column(
        "preference_id",
        UUID(as_uuid=True),
        ForeignKey("player_preferences.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("game_categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
) 