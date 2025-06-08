"""Add game_sessions table for multi-player session tracking

Revision ID: 502581f6e512
Revises: 221a4730c744
Create Date: 2025-06-08 19:13:00.485876+00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "502581f6e512"
down_revision: Union[str, None] = "221a4730c744"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create game_sessions table
    op.create_table(
        'game_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('bga_table_id', sa.String(length=50), nullable=False),
        sa.Column('bga_game_id', sa.String(length=50), nullable=False),
        sa.Column('game_name', sa.String(length=200), nullable=False),
        sa.Column('play_date', sa.DateTime(), nullable=False),
        sa.Column('player_ids', sa.JSON(), nullable=False),
        sa.Column('player_names', sa.JSON(), nullable=False),
        sa.Column('scores', sa.JSON(), nullable=False),
        sa.Column('rankings', sa.JSON(), nullable=False),
        sa.Column('game_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('bga_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_game_sessions_bga_table_id'), 'game_sessions', ['bga_table_id'], unique=True)
    op.create_index(op.f('ix_game_sessions_bga_game_id'), 'game_sessions', ['bga_game_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_game_sessions_bga_game_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_bga_table_id'), table_name='game_sessions')
    
    # Drop table
    op.drop_table('game_sessions')
