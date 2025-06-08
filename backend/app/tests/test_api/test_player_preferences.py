"""Tests for player preferences API endpoints."""
import pytest
from uuid import uuid4

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.player import Player
from app.models.player_preferences import PlayerPreferences


@pytest.mark.asyncio
class TestPlayerPreferencesAPI:
    """Test cases for player preferences API endpoints."""

    async def test_get_preferences_existing(
        self, async_client, async_session, sample_player_with_preferences
    ):
        """Test getting existing player preferences."""
        player, preferences = sample_player_with_preferences
        
        response = await async_client.get(f"/api/v1/players/{player.id}/preferences")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(preferences.id)
        assert data["player_id"] == str(player.id)
        assert data["minimum_play_time"] == preferences.minimum_play_time
        assert data["maximum_play_time"] == preferences.maximum_play_time

    async def test_get_preferences_nonexistent_player(self, async_client):
        """Test getting preferences for nonexistent player."""
        fake_player_id = uuid4()
        
        response = await async_client.get(f"/api/v1/players/{fake_player_id}/preferences")
        
        assert response.status_code == 404
        assert "Player not found" in response.json()["detail"]

    async def test_get_preferences_creates_default(
        self, async_client, async_session, sample_player
    ):
        """Test that getting preferences creates default ones if none exist."""
        response = await async_client.get(f"/api/v1/players/{sample_player.id}/preferences")
        
        assert response.status_code == 200
        data = response.json()
        assert data["player_id"] == str(sample_player.id)
        assert data["minimum_play_time"] is None
        assert data["maximum_play_time"] is None
        assert len(data["preferred_categories"]) == 0

    async def test_update_preferences_create_new(
        self, async_client, async_session, sample_player, sample_categories
    ):
        """Test updating preferences when none exist (creates new)."""
        category_ids = [str(cat.id) for cat in sample_categories[:2]]
        
        update_data = {
            "minimum_play_time": 45,
            "maximum_play_time": 90,
            "preferred_player_count": 3,
            "preferred_complexity_min": 2.5,
            "preferred_complexity_max": 4.0,
            "preferred_category_ids": category_ids,
        }
        
        response = await async_client.put(
            f"/api/v1/players/{sample_player.id}/preferences",
            json=update_data,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["player_id"] == str(sample_player.id)
        assert data["minimum_play_time"] == 45
        assert data["maximum_play_time"] == 90
        assert data["preferred_player_count"] == 3
        assert data["preferred_complexity_min"] == 2.5
        assert data["preferred_complexity_max"] == 4.0
        assert len(data["preferred_categories"]) == 2

    async def test_update_preferences_existing(
        self, async_client, async_session, sample_player_with_preferences
    ):
        """Test updating existing preferences."""
        player, preferences = sample_player_with_preferences
        
        update_data = {
            "minimum_play_time": 60,
            "maximum_play_time": 180,
            "preferred_player_count": 6,
        }
        
        response = await async_client.put(
            f"/api/v1/players/{player.id}/preferences",
            json=update_data,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["minimum_play_time"] == 60
        assert data["maximum_play_time"] == 180
        assert data["preferred_player_count"] == 6
        # Other fields should remain unchanged
        assert data["preferred_complexity_min"] == preferences.preferred_complexity_min

    async def test_update_preferences_validation_error(
        self, async_client, sample_player
    ):
        """Test validation error when updating preferences."""
        update_data = {
            "minimum_play_time": 120,
            "maximum_play_time": 60,  # Invalid: max < min
        }
        
        response = await async_client.put(
            f"/api/v1/players/{sample_player.id}/preferences",
            json=update_data,
        )
        
        assert response.status_code == 422

    async def test_update_preferences_nonexistent_player(self, async_client):
        """Test updating preferences for nonexistent player."""
        fake_player_id = uuid4()
        
        update_data = {
            "minimum_play_time": 30,
            "maximum_play_time": 90,
        }
        
        response = await async_client.put(
            f"/api/v1/players/{fake_player_id}/preferences",
            json=update_data,
        )
        
        assert response.status_code == 404
        assert "Player not found" in response.json()["detail"]


@pytest.mark.asyncio
class TestGameCompatibilityAPI:
    """Test cases for game compatibility API endpoint."""

    async def test_get_compatibility_success(
        self, async_client, async_session, sample_game_with_categories, sample_player_with_preferences
    ):
        """Test successful compatibility calculation."""
        game = sample_game_with_categories
        player, preferences = sample_player_with_preferences
        
        response = await async_client.get(
            f"/api/v1/games/{game.id}/compatibility",
            params={"player_id": str(player.id)},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_id"] == str(game.id)
        assert data["player_id"] == str(player.id)
        assert "compatibility_score" in data
        assert "recommendation" in data
        assert "details" in data
        assert 0.0 <= data["compatibility_score"] <= 1.0

    async def test_get_compatibility_nonexistent_game(
        self, async_client, sample_player_with_preferences
    ):
        """Test compatibility for nonexistent game."""
        fake_game_id = uuid4()
        player, _ = sample_player_with_preferences
        
        response = await async_client.get(
            f"/api/v1/games/{fake_game_id}/compatibility",
            params={"player_id": str(player.id)},
        )
        
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    async def test_get_compatibility_nonexistent_preferences(
        self, async_client, sample_game_with_categories, sample_player
    ):
        """Test compatibility for player without preferences."""
        game = sample_game_with_categories
        
        response = await async_client.get(
            f"/api/v1/games/{game.id}/compatibility",
            params={"player_id": str(sample_player.id)},
        )
        
        assert response.status_code == 404
        assert "Player preferences not found" in response.json()["detail"]

    async def test_compatibility_calculation_details(
        self, async_client, async_session, sample_categories
    ):
        """Test detailed compatibility calculation."""
        # Create a player with specific preferences
        player = Player(username="testplayer", display_name="Test Player")
        async_session.add(player)
        await async_session.commit()
        await async_session.refresh(player)
        
        preferences = PlayerPreferences(
            player_id=player.id,
            minimum_play_time=30,
            maximum_play_time=90,
            preferred_player_count=4,
            preferred_complexity_min=2.0,
            preferred_complexity_max=4.0,
            preferred_categories=sample_categories[:1],  # One category
        )
        async_session.add(preferences)
        await async_session.commit()
        await async_session.refresh(preferences, ["preferred_categories"])
        
        # Create a compatible game
        game = Game(
            name="Compatible Game",
            description="A compatible game",
            min_players=3,
            max_players=5,
            average_play_time=60,
            complexity_rating=3.0,
            categories=sample_categories[:1],  # Same category
        )
        async_session.add(game)
        await async_session.commit()
        await async_session.refresh(game, ["categories"])
        
        response = await async_client.get(
            f"/api/v1/games/{game.id}/compatibility",
            params={"player_id": str(player.id)},
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be highly compatible
        assert data["compatibility_score"] == 1.0
        assert data["recommendation"] == "recommended"
        assert data["details"]["player_count"] == "compatible"
        assert data["details"]["play_time"] == "compatible"
        assert data["details"]["complexity"] == "compatible"
        assert data["details"]["categories"] == "compatible"


@pytest.fixture
async def sample_player(async_session):
    """Create a sample player for testing."""
    player = Player(username="testplayer", display_name="Test Player")
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
async def sample_player_with_preferences(async_session, sample_player, sample_categories):
    """Create a sample player with preferences for testing."""
    preferences = PlayerPreferences(
        player_id=sample_player.id,
        minimum_play_time=30,
        maximum_play_time=120,
        preferred_player_count=4,
        preferred_complexity_min=2.0,
        preferred_complexity_max=4.0,
        preferred_categories=sample_categories[:2],
    )
    async_session.add(preferences)
    await async_session.commit()
    await async_session.refresh(preferences, ["preferred_categories"])
    return sample_player, preferences


@pytest.fixture
async def sample_game_with_categories(async_session, sample_categories):
    """Create a sample game with categories for testing."""
    game = Game(
        name="Test Game",
        description="A test game",
        min_players=2,
        max_players=6,
        average_play_time=90,
        complexity_rating=3.5,
        categories=sample_categories[:2],
    )
    async_session.add(game)
    await async_session.commit()
    await async_session.refresh(game, ["categories"])
    return game 