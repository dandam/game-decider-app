"""Tests for CompatibilityService."""
import pytest
from uuid import uuid4

from app.models.game import Game
from app.models.game_category import GameCategory
from app.models.player_preferences import PlayerPreferences
from app.services.compatibility import CompatibilityService


class TestCompatibilityService:
    """Test cases for CompatibilityService."""

    def test_perfect_compatibility(self):
        """Test perfect compatibility scenario."""
        # Create categories
        strategy_category = GameCategory(
            id=uuid4(),
            name="Strategy",
            description="Strategic games"
        )
        
        # Create game that matches all preferences
        game = Game(
            id=uuid4(),
            name="Perfect Game",
            description="A perfectly compatible game",
            min_players=3,
            max_players=5,
            average_play_time=60,
            complexity_rating=3.0,
            categories=[strategy_category],
        )
        
        # Create preferences that match the game
        preferences = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=30,
            maximum_play_time=90,
            preferred_player_count=4,
            preferred_complexity_min=2.0,
            preferred_complexity_max=4.0,
            preferred_categories=[strategy_category],
        )
        
        result = CompatibilityService.calculate_compatibility(game, preferences)
        
        assert result.compatibility_score == 1.0
        assert result.recommendation == "recommended"
        assert result.details["player_count"] == "compatible"
        assert result.details["play_time"] == "compatible"
        assert result.details["complexity"] == "compatible"
        assert result.details["categories"] == "compatible"

    def test_no_compatibility(self):
        """Test no compatibility scenario."""
        # Create categories
        strategy_category = GameCategory(
            id=uuid4(),
            name="Strategy",
            description="Strategic games"
        )
        party_category = GameCategory(
            id=uuid4(),
            name="Party",
            description="Party games"
        )
        
        # Create game that doesn't match preferences
        game = Game(
            id=uuid4(),
            name="Incompatible Game",
            description="An incompatible game",
            min_players=6,
            max_players=8,
            average_play_time=180,
            complexity_rating=5.0,
            categories=[party_category],
        )
        
        # Create preferences that don't match the game
        preferences = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=30,
            maximum_play_time=90,
            preferred_player_count=4,
            preferred_complexity_min=1.0,
            preferred_complexity_max=3.0,
            preferred_categories=[strategy_category],
        )
        
        result = CompatibilityService.calculate_compatibility(game, preferences)
        
        assert result.compatibility_score == 0.0
        assert result.recommendation == "not_recommended"
        assert result.details["player_count"] == "incompatible"
        assert result.details["play_time"] == "incompatible"
        assert result.details["complexity"] == "incompatible"
        assert result.details["categories"] == "incompatible"

    def test_partial_compatibility(self):
        """Test partial compatibility scenario."""
        strategy_category = GameCategory(
            id=uuid4(),
            name="Strategy",
            description="Strategic games"
        )
        
        # Game matches some but not all preferences
        game = Game(
            id=uuid4(),
            name="Partially Compatible Game",
            description="A partially compatible game",
            min_players=3,
            max_players=5,
            average_play_time=120,  # Too long
            complexity_rating=3.0,
            categories=[strategy_category],
        )
        
        preferences = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=30,
            maximum_play_time=90,  # Game is too long
            preferred_player_count=4,
            preferred_complexity_min=2.0,
            preferred_complexity_max=4.0,
            preferred_categories=[strategy_category],
        )
        
        result = CompatibilityService.calculate_compatibility(game, preferences)
        
        assert result.compatibility_score == 0.75  # 3/4 compatible
        assert result.recommendation == "recommended"  # >= 0.75
        assert result.details["player_count"] == "compatible"
        assert result.details["play_time"] == "incompatible"
        assert result.details["complexity"] == "compatible"
        assert result.details["categories"] == "compatible"

    def test_no_preferences_set(self):
        """Test compatibility when no preferences are set."""
        game = Game(
            id=uuid4(),
            name="Any Game",
            description="Any game",
            min_players=2,
            max_players=4,
            average_play_time=60,
            complexity_rating=3.0,
            categories=[],
        )
        
        # Preferences with no values set
        preferences = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=None,
            maximum_play_time=None,
            preferred_player_count=None,
            preferred_complexity_min=None,
            preferred_complexity_max=None,
            preferred_categories=[],
        )
        
        result = CompatibilityService.calculate_compatibility(game, preferences)
        
        # Should get neutral score (0.5) for all factors
        assert result.compatibility_score == 0.5
        assert result.recommendation == "not_recommended"  # < 0.75
        assert result.details["player_count"] == "no_preference"
        assert result.details["play_time"] == "no_preference"
        assert result.details["complexity"] == "no_preference"
        assert result.details["categories"] == "no_preference"

    def test_player_count_edge_cases(self):
        """Test player count compatibility edge cases."""
        game = Game(
            id=uuid4(),
            name="Test Game",
            description="Test game",
            min_players=3,
            max_players=5,
            average_play_time=60,
            complexity_rating=3.0,
            categories=[],
        )
        
        # Test exact min boundary
        preferences_min = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_player_count=3,
            preferred_categories=[],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_min)
        assert result.details["player_count"] == "compatible"
        
        # Test exact max boundary
        preferences_max = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_player_count=5,
            preferred_categories=[],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_max)
        assert result.details["player_count"] == "compatible"
        
        # Test below min
        preferences_below = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_player_count=2,
            preferred_categories=[],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_below)
        assert result.details["player_count"] == "incompatible"
        
        # Test above max
        preferences_above = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_player_count=6,
            preferred_categories=[],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_above)
        assert result.details["player_count"] == "incompatible"

    def test_category_overlap(self):
        """Test category compatibility with various overlap scenarios."""
        strategy_category = GameCategory(id=uuid4(), name="Strategy", description="Strategic games")
        party_category = GameCategory(id=uuid4(), name="Party", description="Party games")
        coop_category = GameCategory(id=uuid4(), name="Cooperative", description="Cooperative games")
        
        # Game with multiple categories
        game = Game(
            id=uuid4(),
            name="Multi-Category Game",
            description="A game with multiple categories",
            min_players=2,
            max_players=4,
            average_play_time=60,
            complexity_rating=3.0,
            categories=[strategy_category, party_category],
        )
        
        # Preferences with overlapping category
        preferences_overlap = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_categories=[strategy_category, coop_category],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_overlap)
        assert result.details["categories"] == "compatible"
        
        # Preferences with no overlapping categories
        preferences_no_overlap = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            preferred_categories=[coop_category],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_no_overlap)
        assert result.details["categories"] == "incompatible"

    def test_recommendation_threshold(self):
        """Test recommendation threshold at 0.75."""
        strategy_category = GameCategory(id=uuid4(), name="Strategy", description="Strategic games")
        
        game = Game(
            id=uuid4(),
            name="Threshold Game",
            description="A game at the recommendation threshold",
            min_players=3,
            max_players=5,
            average_play_time=60,
            complexity_rating=3.0,
            categories=[strategy_category],
        )
        
        # Exactly 0.75 compatibility (3/4 factors compatible)
        preferences_75 = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=30,
            maximum_play_time=90,
            preferred_player_count=4,
            preferred_complexity_min=4.0,  # Incompatible
            preferred_complexity_max=5.0,
            preferred_categories=[strategy_category],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_75)
        assert result.compatibility_score == 0.75
        assert result.recommendation == "recommended"
        
        # Just below 0.75 compatibility (2/4 factors compatible)
        preferences_50 = PlayerPreferences(
            id=uuid4(),
            player_id=uuid4(),
            minimum_play_time=90,  # Incompatible
            maximum_play_time=120,
            preferred_player_count=4,
            preferred_complexity_min=4.0,  # Incompatible
            preferred_complexity_max=5.0,
            preferred_categories=[strategy_category],
        )
        result = CompatibilityService.calculate_compatibility(game, preferences_50)
        assert result.compatibility_score == 0.5
        assert result.recommendation == "not_recommended" 