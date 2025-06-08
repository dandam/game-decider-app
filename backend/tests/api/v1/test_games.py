"""Tests for Game API endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game_category import GameCategory
from app.models.game_tag import GameTag


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


class TestGameEndpoints:
    """Test cases for Game API endpoints."""

    async def test_create_game(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
        sample_category: GameCategory,
        sample_tag: GameTag,
    ):
        """Test creating a new game via API."""
        game_data = {
            "name": "Test Game",
            "description": "A test board game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
            "category_ids": [str(sample_category.id)],
            "tag_ids": [str(sample_tag.id)],
        }
        
        response = await test_client.post("/api/v1/games", json=game_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == game_data["name"]
        assert data["description"] == game_data["description"]
        assert data["min_players"] == game_data["min_players"]
        assert data["max_players"] == game_data["max_players"]
        assert data["average_play_time"] == game_data["average_play_time"]
        assert data["complexity_rating"] == game_data["complexity_rating"]
        assert len(data["categories"]) == 1
        assert len(data["tags"]) == 1
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    async def test_create_game_duplicate_name(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test creating a game with duplicate name returns error."""
        game_data = {
            "name": "Duplicate Game",
            "description": "A test game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        
        # Create first game
        response1 = await test_client.post("/api/v1/games", json=game_data)
        assert response1.status_code == 201
        
        # Try to create duplicate
        response2 = await test_client.post("/api/v1/games", json=game_data)
        assert response2.status_code == 400
        assert "already exists" in response2.json()["detail"]

    async def test_get_games_empty(self, test_client: AsyncClient):
        """Test getting games when none exist."""
        response = await test_client.get("/api/v1/games")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    async def test_get_games_with_data(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test getting games when data exists."""
        # Create test games
        game_data_1 = {
            "name": "Game 1",
            "description": "First test game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        game_data_2 = {
            "name": "Game 2",
            "description": "Second test game",
            "min_players": 1,
            "max_players": 6,
            "average_play_time": 45,
            "complexity_rating": 3.0,
        }
        
        await test_client.post("/api/v1/games", json=game_data_1)
        await test_client.post("/api/v1/games", json=game_data_2)
        
        response = await test_client.get("/api/v1/games")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        # Games should be ordered by name
        assert data[0]["name"] == "Game 1"
        assert data[1]["name"] == "Game 2"

    async def test_get_games_with_pagination(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test games pagination."""
        # Create multiple games
        for i in range(5):
            game_data = {
                "name": f"Game {i:02d}",
                "description": f"Test game {i}",
                "min_players": 2,
                "max_players": 4,
                "average_play_time": 60,
                "complexity_rating": 2.5,
            }
            await test_client.post("/api/v1/games", json=game_data)
        
        # Test pagination
        response = await test_client.get("/api/v1/games?skip=2&limit=2")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Game 02"
        assert data[1]["name"] == "Game 03"

    async def test_get_games_with_search(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test games search functionality."""
        # Create test games
        game_data_1 = {
            "name": "Strategy Game",
            "description": "A strategic board game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        game_data_2 = {
            "name": "Party Game",
            "description": "A fun party game with cards",
            "min_players": 4,
            "max_players": 8,
            "average_play_time": 30,
            "complexity_rating": 1.5,
        }
        
        await test_client.post("/api/v1/games", json=game_data_1)
        await test_client.post("/api/v1/games", json=game_data_2)
        
        # Search by name
        response = await test_client.get("/api/v1/games?search=Strategy")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Strategy Game"
        
        # Search by description
        response = await test_client.get("/api/v1/games?search=cards")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Party Game"

    async def test_get_games_with_player_count_filter(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test filtering games by player count."""
        # Create games with different player counts
        game_data_1 = {
            "name": "Small Game",
            "description": "2-3 player game",
            "min_players": 2,
            "max_players": 3,
            "average_play_time": 30,
            "complexity_rating": 2.0,
        }
        game_data_2 = {
            "name": "Large Game",
            "description": "6-10 player game",
            "min_players": 6,
            "max_players": 10,
            "average_play_time": 60,
            "complexity_rating": 3.0,
        }
        
        await test_client.post("/api/v1/games", json=game_data_1)
        await test_client.post("/api/v1/games", json=game_data_2)
        
        # Filter for games that support exactly 2 players
        response = await test_client.get("/api/v1/games?min_players=2&max_players=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Small Game"
        
        # Filter for games that support 8 players
        response = await test_client.get("/api/v1/games?min_players=8&max_players=8")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Large Game"

    async def test_get_games_with_invalid_filters(self, test_client: AsyncClient):
        """Test games endpoint with invalid filter parameters."""
        # Test invalid player count range
        response = await test_client.get("/api/v1/games?min_players=5&max_players=3")
        assert response.status_code == 400
        assert "min_players cannot be greater than max_players" in response.json()["detail"]
        
        # Test invalid complexity range
        response = await test_client.get("/api/v1/games?min_complexity=4.0&max_complexity=2.0")
        assert response.status_code == 400
        assert "min_complexity cannot be greater than max_complexity" in response.json()["detail"]

    async def test_get_games_count(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test getting games count."""
        # Initially no games
        response = await test_client.get("/api/v1/games/count")
        assert response.status_code == 200
        assert response.json()["count"] == 0
        
        # Create a game
        game_data = {
            "name": "Test Game",
            "description": "A test game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        await test_client.post("/api/v1/games", json=game_data)
        
        # Check count
        response = await test_client.get("/api/v1/games/count")
        assert response.status_code == 200
        assert response.json()["count"] == 1

    async def test_search_games_by_name(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test search games by name endpoint."""
        # Create test games
        game_data_1 = {
            "name": "Monopoly",
            "description": "Classic property trading game",
            "min_players": 2,
            "max_players": 8,
            "average_play_time": 120,
            "complexity_rating": 2.0,
        }
        game_data_2 = {
            "name": "Monopoly Deal",
            "description": "Card version of Monopoly",
            "min_players": 2,
            "max_players": 5,
            "average_play_time": 15,
            "complexity_rating": 1.5,
        }
        
        await test_client.post("/api/v1/games", json=game_data_1)
        await test_client.post("/api/v1/games", json=game_data_2)
        
        # Search for "Monopoly"
        response = await test_client.get("/api/v1/games/search?name=Monopoly")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        # Search for "Deal"
        response = await test_client.get("/api/v1/games/search?name=Deal")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Monopoly Deal"

    async def test_get_game_by_id(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test getting a specific game by ID."""
        # Create a game
        game_data = {
            "name": "Test Game",
            "description": "A test game",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        create_response = await test_client.post("/api/v1/games", json=game_data)
        created_game = create_response.json()
        game_id = created_game["id"]
        
        # Get the game by ID
        response = await test_client.get(f"/api/v1/games/{game_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == game_id
        assert data["name"] == game_data["name"]

    async def test_get_game_by_id_not_found(self, test_client: AsyncClient):
        """Test getting a game by non-existent ID."""
        from uuid import uuid4
        
        fake_id = str(uuid4())
        response = await test_client.get(f"/api/v1/games/{fake_id}")
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    async def test_update_game(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test updating a game."""
        # Create a game
        game_data = {
            "name": "Original Game",
            "description": "Original description",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        create_response = await test_client.post("/api/v1/games", json=game_data)
        created_game = create_response.json()
        game_id = created_game["id"]
        
        # Update the game
        update_data = {
            "name": "Updated Game",
            "complexity_rating": 3.5,
        }
        response = await test_client.put(f"/api/v1/games/{game_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Game"
        assert data["complexity_rating"] == 3.5
        assert data["description"] == "Original description"  # Unchanged

    async def test_update_game_not_found(self, test_client: AsyncClient):
        """Test updating a non-existent game."""
        from uuid import uuid4
        
        fake_id = str(uuid4())
        update_data = {"name": "Updated Game"}
        response = await test_client.put(f"/api/v1/games/{fake_id}", json=update_data)
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    async def test_delete_game(
        self,
        test_client: AsyncClient,
        test_db: AsyncSession,
    ):
        """Test deleting a game."""
        # Create a game
        game_data = {
            "name": "Game to Delete",
            "description": "This game will be deleted",
            "min_players": 2,
            "max_players": 4,
            "average_play_time": 60,
            "complexity_rating": 2.5,
        }
        create_response = await test_client.post("/api/v1/games", json=game_data)
        created_game = create_response.json()
        game_id = created_game["id"]
        
        # Delete the game
        response = await test_client.delete(f"/api/v1/games/{game_id}")
        assert response.status_code == 204
        
        # Verify game is deleted
        get_response = await test_client.get(f"/api/v1/games/{game_id}")
        assert get_response.status_code == 404

    async def test_delete_game_not_found(self, test_client: AsyncClient):
        """Test deleting a non-existent game."""
        from uuid import uuid4
        
        fake_id = str(uuid4())
        response = await test_client.delete(f"/api/v1/games/{fake_id}")
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"] 