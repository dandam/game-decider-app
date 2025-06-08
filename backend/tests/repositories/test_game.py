"""Tests for GameRepository."""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.game_tag import GameTag
from app.repositories.game import GameRepository
from app.schemas.game import GameCreate, GameUpdate


@pytest.fixture
async def sample_category(test_db: AsyncSession) -> GameCategory:
    """Create a sample game category for testing."""
    category = GameCategory(
        name="Strategy",
        description="Strategic board games",
    )
    test_db.add(category)
    await test_db.commit()
    await test_db.refresh(category)
    return category


@pytest.fixture
async def sample_tag(test_db: AsyncSession) -> GameTag:
    """Create a sample game tag for testing."""
    tag = GameTag(
        name="Family Friendly",
        description="Games suitable for families",
    )
    test_db.add(tag)
    await test_db.commit()
    await test_db.refresh(tag)
    return tag


@pytest.fixture
async def sample_game_data(sample_category: GameCategory, sample_tag: GameTag) -> GameCreate:
    """Create sample game data for testing."""
    return GameCreate(
        name="Test Game",
        description="A test board game",
        min_players=2,
        max_players=4,
        average_play_time=60,
        complexity_rating=2.5,
        category_ids=[sample_category.id],
        tag_ids=[sample_tag.id],
    )


class TestGameRepository:
    """Test cases for GameRepository."""

    async def test_create_game(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test creating a new game."""
        repo = GameRepository(test_db)
        game = await repo.create(sample_game_data)
        
        assert game.id is not None
        assert game.name == sample_game_data.name
        assert game.description == sample_game_data.description
        assert game.min_players == sample_game_data.min_players
        assert game.max_players == sample_game_data.max_players
        assert game.average_play_time == sample_game_data.average_play_time
        assert game.complexity_rating == sample_game_data.complexity_rating
        assert len(game.categories) == 1
        assert len(game.tags) == 1

    async def test_get_by_id(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test getting a game by ID."""
        repo = GameRepository(test_db)
        created_game = await repo.create(sample_game_data)
        
        retrieved_game = await repo.get_by_id(created_game.id)
        
        assert retrieved_game is not None
        assert retrieved_game.id == created_game.id
        assert retrieved_game.name == created_game.name
        assert len(retrieved_game.categories) == 1
        assert len(retrieved_game.tags) == 1

    async def test_get_by_id_not_found(self, test_db: AsyncSession):
        """Test getting a game by ID that doesn't exist."""
        repo = GameRepository(test_db)
        from uuid import uuid4
        
        game = await repo.get_by_id(uuid4())
        assert game is None

    async def test_get_all_basic(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test getting all games with basic pagination."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)
        
        # Create a second game
        game_data_2 = GameCreate(
            name="Test Game 2",
            description="Another test game",
            min_players=1,
            max_players=6,
            average_play_time=45,
            complexity_rating=3.0,
        )
        await repo.create(game_data_2)
        
        games = await repo.get_all(limit=10)
        assert len(games) == 2

    async def test_get_all_with_search(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test getting games with search functionality."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)
        
        # Create a game with different name
        game_data_2 = GameCreate(
            name="Different Game",
            description="A completely different game",
            min_players=1,
            max_players=6,
            average_play_time=45,
            complexity_rating=3.0,
        )
        await repo.create(game_data_2)
        
        # Search by name
        games = await repo.get_all(search="Test")
        assert len(games) == 1
        assert games[0].name == "Test Game"
        
        # Search by description
        games = await repo.get_all(search="board")
        assert len(games) == 1
        assert games[0].name == "Test Game"

    async def test_get_all_with_player_count_filter(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test filtering games by player count."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)  # 2-4 players
        
        # Create a game with different player count
        game_data_2 = GameCreate(
            name="Large Group Game",
            description="A game for many players",
            min_players=6,
            max_players=10,
            average_play_time=90,
            complexity_rating=4.0,
        )
        await repo.create(game_data_2)
        
        # Filter for games that support 3 players
        games = await repo.get_all(min_players=3, max_players=3)
        assert len(games) == 1
        assert games[0].name == "Test Game"
        
        # Filter for games that support 8 players
        games = await repo.get_all(min_players=8, max_players=8)
        assert len(games) == 1
        assert games[0].name == "Large Group Game"

    async def test_get_all_with_complexity_filter(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test filtering games by complexity rating."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)  # complexity 2.5
        
        # Create a more complex game
        game_data_2 = GameCreate(
            name="Complex Game",
            description="A very complex game",
            min_players=2,
            max_players=4,
            average_play_time=120,
            complexity_rating=4.5,
        )
        await repo.create(game_data_2)
        
        # Filter for simple games
        games = await repo.get_all(min_complexity=2.0, max_complexity=3.0)
        assert len(games) == 1
        assert games[0].name == "Test Game"
        
        # Filter for complex games
        games = await repo.get_all(min_complexity=4.0, max_complexity=5.0)
        assert len(games) == 1
        assert games[0].name == "Complex Game"

    async def test_count_filtered(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test counting filtered games."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)
        
        game_data_2 = GameCreate(
            name="Another Game",
            description="Another test game",
            min_players=1,
            max_players=2,
            average_play_time=30,
            complexity_rating=1.5,
        )
        await repo.create(game_data_2)
        
        # Count all games
        count = await repo.count_filtered()
        assert count == 2
        
        # Count with search filter
        count = await repo.count_filtered(search="Test")
        assert count == 1
        
        # Count with complexity filter
        count = await repo.count_filtered(min_complexity=2.0)
        assert count == 1

    async def test_update_game(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test updating a game."""
        repo = GameRepository(test_db)
        game = await repo.create(sample_game_data)
        
        update_data = GameUpdate(
            name="Updated Game Name",
            complexity_rating=3.5,
        )
        
        updated_game = await repo.update(game, update_data)
        
        assert updated_game.name == "Updated Game Name"
        assert updated_game.complexity_rating == 3.5
        assert updated_game.description == sample_game_data.description  # Unchanged

    async def test_delete_game(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test deleting a game."""
        repo = GameRepository(test_db)
        game = await repo.create(sample_game_data)
        game_id = game.id
        
        await repo.delete(game)
        
        # Verify game is deleted
        deleted_game = await repo.get_by_id(game_id)
        assert deleted_game is None

    async def test_search_by_name(
        self,
        test_db: AsyncSession,
        sample_game_data: GameCreate,
    ):
        """Test searching games by name."""
        repo = GameRepository(test_db)
        await repo.create(sample_game_data)
        
        game_data_2 = GameCreate(
            name="Test Strategy Game",
            description="A strategic test game",
            min_players=2,
            max_players=4,
            average_play_time=90,
            complexity_rating=3.0,
        )
        await repo.create(game_data_2)
        
        # Search for games with "Test" in name
        games = await repo.search_by_name("Test", limit=10)
        assert len(games) == 2
        
        # Search for specific game
        games = await repo.search_by_name("Strategy", limit=10)
        assert len(games) == 1
        assert games[0].name == "Test Strategy Game"

    async def test_get_by_bga_id(
        self,
        test_db: AsyncSession,
        sample_category: GameCategory,
    ):
        """Test getting a game by BoardGameArena ID."""
        repo = GameRepository(test_db)
        
        # Create a game with BGA ID
        game_data = GameCreate(
            name="BGA Game",
            description="A game from BoardGameArena",
            min_players=2,
            max_players=4,
            average_play_time=60,
            complexity_rating=2.5,
        )
        game = await repo.create(game_data)
        
        # Manually set BGA ID (since it's not in the create schema)
        game.bga_id = "test_bga_123"
        await test_db.commit()
        await test_db.refresh(game)
        
        # Test retrieval by BGA ID
        retrieved_game = await repo.get_by_bga_id("test_bga_123")
        assert retrieved_game is not None
        assert retrieved_game.id == game.id
        assert retrieved_game.bga_id == "test_bga_123"
        
        # Test non-existent BGA ID
        not_found = await repo.get_by_bga_id("nonexistent")
        assert not_found is None 