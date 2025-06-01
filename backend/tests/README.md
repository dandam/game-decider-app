# Backend Testing Guide

## Overview
This directory contains the test suite for the Game Decider App backend. We use pytest as our testing framework, with additional support for async testing and coverage reporting.

## Directory Structure
```
tests/
├── api/          # API endpoint tests
├── core/         # Core functionality tests
├── models/       # Database model tests
├── schemas/      # Pydantic schema tests
├── services/     # Business logic tests
├── integration/  # End-to-end integration tests
├── utils/        # Test utilities and helpers
├── conftest.py   # Shared test fixtures
└── README.md     # This file
```

## Test Categories
- **Unit Tests**: Located in respective module directories (api/, models/, etc.)
- **Integration Tests**: In the integration/ directory
- **API Tests**: End-to-end tests using TestClient in api/

## Key Features
- Async test support with pytest-asyncio
- In-memory SQLite database for testing
- Dependency injection overrides
- Shared test fixtures
- Utility functions for common assertions

## Running Tests
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app

# Run specific test file
pytest tests/api/test_health.py

# Run tests matching a pattern
pytest -k "health"

# Run tests with detailed output
pytest -v
```

## Writing Tests
1. Use appropriate test directory based on what you're testing
2. Follow naming convention: test_*.py for files, test_* for functions
3. Use fixtures from conftest.py
4. Use utility functions from utils/test_utils.py
5. Include docstrings explaining test purpose

## Fixtures
- `test_app`: FastAPI application instance
- `test_client`: HTTPX AsyncClient for API requests
- `test_db`: SQLAlchemy async session
- `test_db_engine`: Database engine

## Best Practices
1. Keep tests focused and atomic
2. Use descriptive test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Mock external dependencies
5. Clean up test data
6. Use parametrized tests for multiple cases
7. Add proper error messages to assertions

## Coverage Goals
- Minimum 80% coverage for new code
- Focus on critical paths and edge cases
- Include both success and failure scenarios 