"""Create initial tables

Revision ID: 221a4730c744
Revises: 
Create Date: 2025-06-01 21:35:53.656026+00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "221a4730c744"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create game categories table
    op.create_table(
        "game_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        "ix_game_categories_name",
        "game_categories",
        ["name"],
    )

    # Create game tags table
    op.create_table(
        "game_tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        "ix_game_tags_name",
        "game_tags",
        ["name"],
    )

    # Create games table
    op.create_table(
        "games",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=False),
        sa.Column("min_players", sa.Integer(), nullable=False),
        sa.Column("max_players", sa.Integer(), nullable=False),
        sa.Column("average_play_time", sa.Integer(), nullable=False),
        sa.Column("complexity_rating", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("max_players >= min_players", name="check_valid_player_range"),
        sa.CheckConstraint("complexity_rating >= 1.0 AND complexity_rating <= 5.0", name="check_valid_complexity"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create players table
    op.create_table(
        "players",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("avatar_url", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index(
        "ix_players_username",
        "players",
        ["username"],
    )

    # Create player preferences table
    op.create_table(
        "player_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("player_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("minimum_play_time", sa.Integer(), nullable=True),
        sa.Column("maximum_play_time", sa.Integer(), nullable=True),
        sa.Column("preferred_player_count", sa.Integer(), nullable=True),
        sa.Column("preferred_complexity_min", sa.Float(), nullable=True),
        sa.Column("preferred_complexity_max", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "(maximum_play_time IS NULL) OR (minimum_play_time IS NULL) OR (maximum_play_time >= minimum_play_time)",
            name="check_valid_play_time_range",
        ),
        sa.CheckConstraint(
            "(preferred_complexity_max IS NULL) OR (preferred_complexity_min IS NULL) OR (preferred_complexity_max >= preferred_complexity_min)",
            name="check_valid_complexity_range",
        ),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("player_id"),
    )

    # Create player game history table
    op.create_table(
        "player_game_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("player_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("game_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("play_date", sa.DateTime(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "rating IS NULL OR (rating >= 1.0 AND rating <= 5.0)",
            name="check_valid_rating",
        ),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create games_categories association table
    op.create_table(
        "games_categories",
        sa.Column("game_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["game_categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("game_id", "category_id"),
    )

    # Create games_tags association table
    op.create_table(
        "games_tags",
        sa.Column("game_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["game_tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("game_id", "tag_id"),
    )

    # Create player_preferred_categories association table
    op.create_table(
        "player_preferred_categories",
        sa.Column("preference_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["game_categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["preference_id"], ["player_preferences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("preference_id", "category_id"),
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation (respecting foreign key constraints)
    op.drop_table("player_preferred_categories")
    op.drop_table("games_tags")
    op.drop_table("games_categories")
    op.drop_table("player_game_history")
    op.drop_table("player_preferences")
    op.drop_table("players")
    op.drop_table("games")
    op.drop_table("game_tags")
    op.drop_table("game_categories")
