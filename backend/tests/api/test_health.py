"""Tests for the health check endpoint."""
import pytest
from httpx import AsyncClient

from tests.utils.test_utils import assert_successful_response, assert_valid_schema

pytestmark = pytest.mark.asyncio


async def test_health_check(test_client: AsyncClient):
    """Test the health check endpoint."""
    response = await test_client.get("/health")
    
    assert_successful_response(response.status_code)
    
    data = response.json()
    expected_keys = {"status", "timestamp"}
    assert_valid_schema(data, expected_keys)
    assert data["status"] == "healthy"


async def test_health_check_with_db(test_client: AsyncClient, test_db):
    """Test the health check endpoint with database connection."""
    response = await test_client.get("/health/db")
    
    assert_successful_response(response.status_code)
    
    data = response.json()
    expected_keys = {"status", "timestamp", "database"}
    assert_valid_schema(data, expected_keys)
    assert data["status"] == "healthy"
    assert data["database"] == "connected" 