"""Test utility functions and helpers."""
from typing import Any, Dict

from fastapi import FastAPI
from httpx import AsyncClient


async def create_test_data(client: AsyncClient, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create test data through the API."""
    response = await client.post(endpoint, json=data)
    return response.json()


def get_settings_override():
    """Override settings for testing."""
    return {
        "testing": True,
        "database_url": "sqlite+aiosqlite:///:memory:",
    }


def assert_valid_schema(data: Dict[str, Any], expected_keys: set[str]) -> None:
    """Assert that a dictionary has all expected keys."""
    assert isinstance(data, dict), "Response data must be a dictionary"
    assert set(data.keys()) == expected_keys, f"Expected keys {expected_keys}, got {set(data.keys())}"


def assert_successful_response(status_code: int, expected_code: int = 200) -> None:
    """Assert that a response status code matches the expected code."""
    assert status_code == expected_code, f"Expected status code {expected_code}, got {status_code}" 