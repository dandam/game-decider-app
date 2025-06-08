"""Game repository module."""
from typing import List, Optional, Sequence
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.game_tag import GameTag
from app.schemas.game import GameCreate, GameUpdate


class GameRepository:
    """Repository for game-related database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, game_data: GameCreate) -> Game:
        """Create a new game."""
        # Create game without relationships first
        game_dict = game_data.model_dump(exclude={"category_ids", "tag_ids"})
        game = Game(**game_dict)
        
        # Handle categories
        if game_data.category_ids:
            categories = await self.session.execute(
                select(GameCategory).where(GameCategory.id.in_(game_data.category_ids))
            )
            game.categories = list(categories.scalars().all())
        
        # Handle tags
        if game_data.tag_ids:
            tags = await self.session.execute(
                select(GameTag).where(GameTag.id.in_(game_data.tag_ids))
            )
            game.tags = list(tags.scalars().all())
        
        self.session.add(game)
        await self.session.commit()
        await self.session.refresh(game, ["categories", "tags"])
        return game

    async def get_by_id(self, game_id: UUID) -> Optional[Game]:
        """Get a game by ID with relationships loaded."""
        result = await self.session.execute(
            select(Game)
            .options(
                selectinload(Game.categories),
                selectinload(Game.tags),
            )
            .where(Game.id == game_id)
        )
        return result.scalar_one_or_none()

    async def get_by_bga_id(self, bga_id: str) -> Optional[Game]:
        """Get a game by BoardGameArena ID."""
        result = await self.session.execute(
            select(Game)
            .options(
                selectinload(Game.categories),
                selectinload(Game.tags),
            )
            .where(Game.bga_id == bga_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        min_players: Optional[int] = None,
        max_players: Optional[int] = None,
        min_play_time: Optional[int] = None,
        max_play_time: Optional[int] = None,
        min_complexity: Optional[float] = None,
        max_complexity: Optional[float] = None,
        category_ids: Optional[List[UUID]] = None,
        tag_ids: Optional[List[UUID]] = None,
        category_filter_mode: str = "any",  # "any" or "all"
        tag_filter_mode: str = "any",  # "any" or "all"
    ) -> Sequence[Game]:
        """Get games with advanced filtering and search."""
        query = select(Game).options(
            selectinload(Game.categories),
            selectinload(Game.tags),
        )
        
        # Build filter conditions
        conditions = []
        
        # Search in name and description
        if search:
            search_term = f"%{search.lower()}%"
            conditions.append(
                or_(
                    func.lower(Game.name).like(search_term),
                    func.lower(Game.description).like(search_term),
                )
            )
        
        # Player count filters
        if min_players is not None:
            conditions.append(Game.max_players >= min_players)
        if max_players is not None:
            conditions.append(Game.min_players <= max_players)
        
        # Play time filters
        if min_play_time is not None:
            conditions.append(Game.average_play_time >= min_play_time)
        if max_play_time is not None:
            conditions.append(Game.average_play_time <= max_play_time)
        
        # Complexity filters
        if min_complexity is not None:
            conditions.append(Game.complexity_rating >= min_complexity)
        if max_complexity is not None:
            conditions.append(Game.complexity_rating <= max_complexity)
        
        # Category filters
        if category_ids:
            if category_filter_mode == "all":
                # Game must have ALL specified categories
                for category_id in category_ids:
                    conditions.append(
                        Game.categories.any(GameCategory.id == category_id)
                    )
            else:
                # Game must have ANY of the specified categories
                conditions.append(
                    Game.categories.any(GameCategory.id.in_(category_ids))
                )
        
        # Tag filters
        if tag_ids:
            if tag_filter_mode == "all":
                # Game must have ALL specified tags
                for tag_id in tag_ids:
                    conditions.append(
                        Game.tags.any(GameTag.id == tag_id)
                    )
            else:
                # Game must have ANY of the specified tags
                conditions.append(
                    Game.tags.any(GameTag.id.in_(tag_ids))
                )
        
        # Apply all conditions
        if conditions:
            query = query.where(and_(*conditions))
        
        # Add ordering (by name for consistency)
        query = query.order_by(Game.name)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_filtered(
        self,
        search: Optional[str] = None,
        min_players: Optional[int] = None,
        max_players: Optional[int] = None,
        min_play_time: Optional[int] = None,
        max_play_time: Optional[int] = None,
        min_complexity: Optional[float] = None,
        max_complexity: Optional[float] = None,
        category_ids: Optional[List[UUID]] = None,
        tag_ids: Optional[List[UUID]] = None,
        category_filter_mode: str = "any",
        tag_filter_mode: str = "any",
    ) -> int:
        """Count games matching the filter criteria."""
        query = select(func.count(Game.id))
        
        # Build the same filter conditions as get_all
        conditions = []
        
        if search:
            search_term = f"%{search.lower()}%"
            conditions.append(
                or_(
                    func.lower(Game.name).like(search_term),
                    func.lower(Game.description).like(search_term),
                )
            )
        
        if min_players is not None:
            conditions.append(Game.max_players >= min_players)
        if max_players is not None:
            conditions.append(Game.min_players <= max_players)
        
        if min_play_time is not None:
            conditions.append(Game.average_play_time >= min_play_time)
        if max_play_time is not None:
            conditions.append(Game.average_play_time <= max_play_time)
        
        if min_complexity is not None:
            conditions.append(Game.complexity_rating >= min_complexity)
        if max_complexity is not None:
            conditions.append(Game.complexity_rating <= max_complexity)
        
        if category_ids:
            if category_filter_mode == "all":
                for category_id in category_ids:
                    conditions.append(
                        Game.categories.any(GameCategory.id == category_id)
                    )
            else:
                conditions.append(
                    Game.categories.any(GameCategory.id.in_(category_ids))
                )
        
        if tag_ids:
            if tag_filter_mode == "all":
                for tag_id in tag_ids:
                    conditions.append(
                        Game.tags.any(GameTag.id == tag_id)
                    )
            else:
                conditions.append(
                    Game.tags.any(GameTag.id.in_(tag_ids))
                )
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await self.session.execute(query)
        return result.scalar() or 0

    async def update(self, game: Game, game_data: GameUpdate) -> Game:
        """Update a game."""
        # Update basic fields
        update_data = game_data.model_dump(
            exclude_unset=True, exclude={"category_ids", "tag_ids"}
        )
        for field, value in update_data.items():
            setattr(game, field, value)
        
        # Handle category updates
        if game_data.category_ids is not None:
            if game_data.category_ids:
                categories = await self.session.execute(
                    select(GameCategory).where(
                        GameCategory.id.in_(game_data.category_ids)
                    )
                )
                game.categories = list(categories.scalars().all())
            else:
                game.categories = []
        
        # Handle tag updates
        if game_data.tag_ids is not None:
            if game_data.tag_ids:
                tags = await self.session.execute(
                    select(GameTag).where(GameTag.id.in_(game_data.tag_ids))
                )
                game.tags = list(tags.scalars().all())
            else:
                game.tags = []
        
        await self.session.commit()
        await self.session.refresh(game, ["categories", "tags"])
        return game

    async def delete(self, game: Game) -> None:
        """Delete a game."""
        await self.session.delete(game)
        await self.session.commit()

    async def search_by_name(self, name: str, limit: int = 10) -> Sequence[Game]:
        """Search games by name (for autocomplete/suggestions)."""
        search_term = f"%{name.lower()}%"
        result = await self.session.execute(
            select(Game)
            .options(
                selectinload(Game.categories),
                selectinload(Game.tags),
            )
            .where(func.lower(Game.name).like(search_term))
            .order_by(Game.name)
            .limit(limit)
        )
        return result.scalars().all() 