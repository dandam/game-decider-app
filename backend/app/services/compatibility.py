"""Game-player compatibility service module."""
from typing import Dict

from app.models.game import Game
from app.models.player_preferences import PlayerPreferences
from app.schemas.compatibility import CompatibilityResponse


class CompatibilityService:
    """Service for calculating game-player compatibility."""

    @staticmethod
    def calculate_compatibility(
        game: Game, preferences: PlayerPreferences
    ) -> CompatibilityResponse:
        """Calculate compatibility between a game and player preferences."""
        score = 0.0
        max_score = 4.0  # 4 factors
        details: Dict[str, str] = {}
        
        # Player count compatibility (25%)
        if preferences.preferred_player_count is not None:
            if game.min_players <= preferences.preferred_player_count <= game.max_players:
                score += 1.0
                details["player_count"] = "compatible"
            else:
                details["player_count"] = "incompatible"
        else:
            # If no preference set, consider neutral (half score)
            score += 0.5
            details["player_count"] = "no_preference"
        
        # Play time compatibility (25%)
        if (
            preferences.minimum_play_time is not None
            and preferences.maximum_play_time is not None
        ):
            if (
                preferences.minimum_play_time
                <= game.average_play_time
                <= preferences.maximum_play_time
            ):
                score += 1.0
                details["play_time"] = "compatible"
            else:
                details["play_time"] = "incompatible"
        else:
            # If no preference set, consider neutral (half score)
            score += 0.5
            details["play_time"] = "no_preference"
        
        # Complexity compatibility (25%)
        if (
            preferences.preferred_complexity_min is not None
            and preferences.preferred_complexity_max is not None
        ):
            if (
                preferences.preferred_complexity_min
                <= game.complexity_rating
                <= preferences.preferred_complexity_max
            ):
                score += 1.0
                details["complexity"] = "compatible"
            else:
                details["complexity"] = "incompatible"
        else:
            # If no preference set, consider neutral (half score)
            score += 0.5
            details["complexity"] = "no_preference"
        
        # Category compatibility (25%)
        if preferences.preferred_categories:
            game_category_ids = {cat.id for cat in game.categories}
            preferred_category_ids = {cat.id for cat in preferences.preferred_categories}
            if game_category_ids & preferred_category_ids:  # Any overlap
                score += 1.0
                details["categories"] = "compatible"
            else:
                details["categories"] = "incompatible"
        else:
            # If no categories preferred, consider neutral (half score)
            score += 0.5
            details["categories"] = "no_preference"
        
        compatibility_score = score / max_score
        recommendation = "recommended" if compatibility_score >= 0.75 else "not_recommended"
        
        return CompatibilityResponse(
            game_id=game.id,
            player_id=preferences.player_id,
            compatibility_score=compatibility_score,
            recommendation=recommendation,
            details=details,
        ) 