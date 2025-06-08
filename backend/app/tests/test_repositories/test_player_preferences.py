"""Tests for PlayerPreferencesRepository."""
import pytest
from uuid import uuid4

from app.models.game_category import GameCategory
from app.models.player import Player
from app.models.player_preferences import PlayerPreferences
from app.repositories.player_preferences import PlayerPreferencesRepository
from app.schemas.player_preferences import PlayerPreferencesCreate, PlayerPreferencesUpdate


@pytest.mark.asyncio
class TestPlayerPreferencesRepository:
    """Test cases for PlayerPreferencesRepository."""

    async def test_create_preferences_without_categories(self, async_session, sample_player):
        """Test creating preferences without categories."""
        repo = PlayerPreferencesRepository(async_session)
        
        preferences_data = PlayerPreferencesCreate(
            player_id=sample_player.id,
            minimum_play_time=30,
            maximum_play_time=120,
            preferred_player_count=4,
            preferred_complexity_min=2.0,
            preferred_complexity_max=4.0,
            preferred_category_ids=[],
        )
        
        preferences = await repo.create(preferences_data)
        
        assert preferences.id is not None
        assert preferences.player_id == sample_player.id
        assert preferences.minimum_play_time == 30
        assert preferences.maximum_play_time == 120
        assert preferences.preferred_player_count == 4
        assert preferences.preferred_complexity_min == 2.0
        assert preferences.preferred_complexity_max == 4.0
        assert len(preferences.preferred_categories) == 0

    async def test_create_preferences_with_categories(
        self, async_session, sample_player, sample_categories
    ):
        """Test creating preferences with categories."""
        repo = PlayerPreferencesRepository(async_session)
        
        category_ids = [cat.id for cat in sample_categories[:2]]
        preferences_data = PlayerPreferencesCreate(
            player_id=sample_player.id,
            minimum_play_time=45,
            maximum_play_time=90,
            preferred_category_ids=category_ids,
        )
        
        preferences = await repo.create(preferences_data)
        
        assert preferences.id is not None
        assert preferences.player_id == sample_player.id
        assert preferences.minimum_play_time == 45
        assert preferences.maximum_play_time == 90
        assert len(preferences.preferred_categories) == 2
        assert {cat.id for cat in preferences.preferred_categories} == set(category_ids)

    async def test_get_by_player_id_existing(self, async_session, sample_player_preferences):
        """Test getting preferences by player ID when they exist."""
        repo = PlayerPreferencesRepository(async_session)
        
        preferences = await repo.get_by_player_id(sample_player_preferences.player_id)
        
        assert preferences is not None
        assert preferences.id == sample_player_preferences.id
        assert preferences.player_id == sample_player_preferences.player_id

    async def test_get_by_player_id_nonexistent(self, async_session):
        """Test getting preferences by player ID when they don't exist."""
        repo = PlayerPreferencesRepository(async_session)
        
        preferences = await repo.get_by_player_id(uuid4())
        
        assert preferences is None

    async def test_update_preferences_scalar_fields(
        self, async_session, sample_player_preferences
    ):
        """Test updating scalar preference fields."""
        repo = PlayerPreferencesRepository(async_session)
        
        update_data = PlayerPreferencesUpdate(
            minimum_play_time=60,
            maximum_play_time=180,
            preferred_player_count=6,
        )
        
        updated_preferences = await repo.update(sample_player_preferences, update_data)
        
        assert updated_preferences.minimum_play_time == 60
        assert updated_preferences.maximum_play_time == 180
        assert updated_preferences.preferred_player_count == 6
        # Other fields should remain unchanged
        assert updated_preferences.preferred_complexity_min == sample_player_preferences.preferred_complexity_min

    async def test_update_preferences_add_categories(
        self, async_session, sample_player_preferences, sample_categories
    ):
        """Test updating preferences to add categories."""
        repo = PlayerPreferencesRepository(async_session)
        
        category_ids = [cat.id for cat in sample_categories[:2]]
        update_data = PlayerPreferencesUpdate(
            preferred_category_ids=category_ids,
        )
        
        updated_preferences = await repo.update(sample_player_preferences, update_data)
        
        assert len(updated_preferences.preferred_categories) == 2
        assert {cat.id for cat in updated_preferences.preferred_categories} == set(category_ids)

    async def test_update_preferences_clear_categories(
        self, async_session, sample_player_preferences_with_categories
    ):
        """Test updating preferences to clear categories."""
        repo = PlayerPreferencesRepository(async_session)
        
        update_data = PlayerPreferencesUpdate(
            preferred_category_ids=[],
        )
        
        updated_preferences = await repo.update(
            sample_player_preferences_with_categories, update_data
        )
        
        assert len(updated_preferences.preferred_categories) == 0

    async def test_delete_preferences(self, async_session, sample_player_preferences):
        """Test deleting preferences."""
        repo = PlayerPreferencesRepository(async_session)
        
        await repo.delete(sample_player_preferences)
        
        # Verify preferences are deleted
        preferences = await repo.get_by_player_id(sample_player_preferences.player_id)
        assert preferences is None


@pytest.fixture
async def sample_player(async_session):
    """Create a sample player for testing."""
    player = Player(
        username="testplayer",
        display_name="Test Player",
    )
    async_session.add(player)
    await async_session.commit()
    await async_session.refresh(player)
    return player


@pytest.fixture
async def sample_categories(async_session):
    """Create sample categories for testing."""
    categories = [
        GameCategory(name="Strategy", description="Strategic games"),
        GameCategory(name="Party", description="Party games"),
        GameCategory(name="Cooperative", description="Cooperative games"),
    ]
    for category in categories:
        async_session.add(category)
    await async_session.commit()
    for category in categories:
        await async_session.refresh(category)
    return categories


@pytest.fixture
async def sample_player_preferences(async_session, sample_player):
    """Create sample player preferences for testing."""
    preferences = PlayerPreferences(
        player_id=sample_player.id,
        minimum_play_time=30,
        maximum_play_time=120,
        preferred_player_count=4,
        preferred_complexity_min=2.0,
        preferred_complexity_max=4.0,
    )
    async_session.add(preferences)
    await async_session.commit()
    await async_session.refresh(preferences)
    return preferences


@pytest.fixture
async def sample_player_preferences_with_categories(
    async_session, sample_player, sample_categories
):
    """Create sample player preferences with categories for testing."""
    preferences = PlayerPreferences(
        player_id=sample_player.id,
        minimum_play_time=45,
        maximum_play_time=90,
        preferred_categories=sample_categories[:2],
    )
    async_session.add(preferences)
    await async_session.commit()
    await async_session.refresh(preferences, ["preferred_categories"])
    return preferences 