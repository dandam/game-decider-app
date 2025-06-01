# Game Night Concierge Backend

This is the backend service for Game Night Concierge, built with FastAPI, SQLAlchemy, and PostgreSQL.

## Core Data Layer

The core data layer is implemented using SQLAlchemy with async support and PostgreSQL as the database. The implementation follows these key principles:

- Use of UUIDs for primary keys
- Automatic timestamp tracking (created_at, updated_at)
- Async database operations
- Type hints and Pydantic models for validation
- Alembic for database migrations

### Models

#### Base Model
All models inherit from a base model that provides:
- UUID primary key
- Created at timestamp
- Updated at timestamp

#### Player Model
Represents a user profile:
- Username (unique)
- Display name
- Avatar URL (optional)
- Future: Preferences and game history relationships

#### Game Model
Represents a board game:
- Name
- Description (optional)
- Player count (min/max)
- Average play time
- Complexity rating
- BoardGameArena ID (optional)
- Future: Categories and tags relationships

### Database Configuration

The database is configured to use PostgreSQL with async support through asyncpg. The connection URL is configurable through environment variables:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/game_night_dev
```

### Migrations

Database migrations are managed with Alembic. Key commands:

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Development Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Unix
   .venv\Scripts\activate     # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   # Start PostgreSQL (if not using Docker)
   docker run --name game-night-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

   # Apply migrations
   alembic upgrade head
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── core/            # Core configuration
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic models
│   ├── api/            # API endpoints
│   └── services/       # Business logic
├── tests/              # Test suite
└── requirements.txt    # Python dependencies
```

## Next Steps

1. Implement remaining relationship models:
   - PlayerPreferences
   - GameCategory
   - GameTag
   - PlayerGameHistory

2. Create API endpoints for:
   - Player profiles
   - Game library
   - Player preferences

3. Add data seeding system for development 