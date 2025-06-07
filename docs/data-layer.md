# Data Layer Implementation Guide

## Overview

The Game Night Concierge application uses a modern, type-safe data layer built with SQLAlchemy 2.0, Pydantic v2, and PostgreSQL. This document outlines the technical implementation, patterns, and best practices used throughout the data layer.

## Technology Stack

### Core Technologies
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **API Framework**: FastAPI
- **Connection Pool**: asyncpg

### Key Dependencies
```toml
sqlalchemy>=2.0.0
alembic==1.13.1
pydantic==2.6.1
pydantic-settings==2.1.0
asyncpg>=0.29.0
```

## Architecture

### Layer Separation
The data layer follows a clear separation of concerns:

1. **Models** (`app/models/`)
   - SQLAlchemy models defining database structure
   - Relationship definitions
   - Database constraints
   - Common base class with shared functionality

2. **Schemas** (`app/schemas/`)
   - Pydantic models for validation
   - Request/response models
   - Data transformation logic
   - Field-level validation rules

3. **Repositories** (`app/repositories/`)
   - Database operation encapsulation
   - Transaction management
   - Complex query logic
   - Relationship handling

4. **Services** (`app/services/`)
   - Business logic
   - Cross-cutting concerns
   - External service integration
   - Complex operations spanning multiple repositories

### Common Patterns

#### Base Model
All database models inherit from `Base` which provides:
- UUID primary key
- Created/updated timestamps
- Common utility methods
- Relationship helpers

```python
class Base:
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
```

#### Schema Structure
Each model has corresponding Pydantic schemas:
- `Base`: Common fields and validation
- `Create`: Creation payload validation
- `Update`: Partial update validation
- `InDB`: Database representation
- `Response`: API response format

#### Relationship Handling
- One-to-One: Unique constraints and single_parent
- One-to-Many: Cascade deletes and back_populates
- Many-to-Many: Association tables with explicit constraints

## Data Models

### Core Entities

1. **Player**
   - Basic profile information
   - 1:1 relationship with preferences
   - 1:M relationship with game history

2. **Game**
   - Game metadata
   - M:M relationships with categories and tags
   - Play time and player count constraints

3. **PlayerPreferences**
   - Time and complexity preferences
   - M:M relationship with preferred categories
   - Validation rules for min/max values

4. **GameCategory & GameTag**
   - Organizational metadata
   - M:M relationships with games
   - Used for filtering and recommendations

### Validation Rules

1. **Field-Level Validation**
   - String length limits
   - Numeric ranges
   - Required vs optional fields
   - Custom validators for complex rules

2. **Relationship Validation**
   - Foreign key constraints
   - Cascade behaviors
   - Unique constraints
   - Optional relationships

3. **Business Rules**
   - Player count validation
   - Time range validation
   - Complexity range validation
   - Rating scale validation

## Database Operations

### Repository Pattern
Each model has a corresponding repository that:
- Encapsulates database operations
- Handles relationship management
- Implements pagination
- Manages transactions

Example:
```python
class PlayerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: PlayerCreate) -> Player:
        player = Player(**data.model_dump())
        self.session.add(player)
        await self.session.commit()
        return player
```

### Query Optimization
- Eager loading for known relationship usage
- Selective column loading
- Proper indexing
- Query result caching (future)

## Migration Management

### Alembic Configuration
- Async migrations support via SQLAlchemy 2.0
- Environment-specific configurations via `env.py`
- Standardized naming with timestamp prefix
- Automatic formatting with Black
- Comprehensive logging setup

### Migration Structure
Each migration follows a consistent structure:
```python
"""Migration description

Revision ID: unique_id
Revises: previous_revision
Create Date: timestamp
"""

# Upgrade operations
def upgrade() -> None:
    # Table creation
    op.create_table(...)
    
    # Index creation
    op.create_index(...)
    
    # Constraints
    op.create_check_constraint(...)

# Downgrade operations
def downgrade() -> None:
    # Reverse operations in correct order
    op.drop_table(...)
```

### Migration Patterns

1. **Table Creation Order**
   - Independent tables first (no foreign keys)
   - Dependent tables following
   - Association tables last
   - Reverse order for downgrades

2. **Constraint Types**
   - Primary Key constraints
   - Unique constraints
   - Foreign Key constraints (with CASCADE delete)
   - Check constraints for business rules
   - Indexes for performance

3. **Data Validation**
   - Length constraints on strings
   - Numeric range validations
   - Relationship integrity
   - Business rule enforcement

4. **Naming Conventions**
   - Descriptive constraint names
   - Consistent index naming
   - Clear table naming
   - Relationship table naming (plural form)

### Example Constraints

1. **Business Rules**
   ```sql
   -- Player count validation
   CHECK (max_players >= min_players)
   
   -- Rating range validation
   CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0))
   
   -- Time preference validation
   CHECK (
       (maximum_play_time IS NULL) OR 
       (minimum_play_time IS NULL) OR 
       (maximum_play_time >= minimum_play_time)
   )
   ```

2. **Relationship Integrity**
   ```sql
   -- One-to-One relationship
   UNIQUE (player_id)
   FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
   
   -- Many-to-Many relationship
   PRIMARY KEY (game_id, category_id)
   FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
   ```

### Migration Management

1. **Creating Migrations**
   ```bash
   # Generate new migration
   alembic revision --autogenerate -m "description"
   
   # Run migrations
   alembic upgrade head
   
   # Rollback one step
   alembic downgrade -1
   ```

2. **Version Control**
   - Migrations are version controlled
   - Each migration has a unique identifier
   - Linear history maintained
   - Dependencies tracked

3. **Testing Strategy**
   - Test both upgrade and downgrade paths
   - Verify constraint enforcement
   - Check data integrity
   - Validate business rules

4. **Deployment Considerations**
   - Backward compatible changes
   - Zero-downtime migrations when possible
   - Proper backup procedures
   - Rollback plans

## Testing Strategy

### Unit Tests
- Model validation
- Schema transformation
- Repository operations
- Service logic

### Integration Tests
- Database operations
- Transaction handling
- Constraint validation
- Relationship management

## Future Considerations

1. **Caching Layer**
   - Redis integration
   - Cache invalidation
   - Selective caching
   - Cache warming

2. **Analytics Support**
   - Denormalized views
   - Aggregation tables
   - Time-series data
   - Performance metrics

3. **Scaling Considerations**
   - Read replicas
   - Sharding strategy
   - Connection pooling
   - Query optimization

## Best Practices

1. **Data Integrity**
   - Use appropriate constraints
   - Validate at schema level
   - Maintain referential integrity
   - Handle cascading operations

2. **Performance**
   - Proper indexing
   - Efficient queries
   - Relationship loading
   - Transaction management

3. **Maintainability**
   - Clear documentation
   - Consistent patterns
   - Type safety
   - Test coverage

4. **Security**
   - Input validation
   - Query parameterization
   - Access control
   - Audit logging

## Data Seeding

### Overview
The application includes a comprehensive seeding system for populating the database with sample data during development. This ensures consistent test data and makes development easier.

### Seeder Structure
```
backend/app/seeds/
├── __init__.py
├── seed_runner.py
└── seeders/
    ├── base.py
    ├── game_categories.py
    ├── game_tags.py
    ├── games.py
    └── players.py
```

### Sample Data
The seeding system provides:
- Game categories (Strategy, Party, Cooperative, etc.)
- Game tags (Family Friendly, Quick Play, Heavy Strategy, etc.)
- Popular board games with relationships to categories and tags
- Sample players with preferences and game history

### Running Seeds

#### Local Development (Docker)
```bash
# Start containers if not running
docker-compose up -d

# Reset database and seed (recommended for fresh start)
docker-compose exec backend python -m app.cli seed --reset

# Seed without resetting (preserves existing data)
docker-compose exec backend python -m app.cli seed

# View seeding logs
docker-compose logs backend
```

#### Local Development (Direct)
```bash
# From the backend directory
python -m app.cli seed --reset  # Reset and seed
python -m app.cli seed         # Just seed
```

#### Environment Variables
The seeding system uses these environment variables (automatically set in Docker):
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=game_night_dev
DATABASE_URL=postgresql://postgres:postgres@db:5432/game_night_dev
```

### Seeder Implementation
Each seeder follows a consistent pattern:
```python
class GameCategoriesSeeder(BaseSeed):
    async def run(self) -> None:
        categories = [GameCategory(**data) for data in SAMPLE_CATEGORIES]
        self.session.add_all(categories)
        await self.session.commit()
```

### Seeding Order
1. Game Categories (independent)
2. Game Tags (independent)
3. Games (depends on categories and tags)
4. Players (depends on categories for preferences)

### Best Practices
1. **Data Quality**
   - Use realistic, varied sample data
   - Cover edge cases and common scenarios
   - Include relationships between entities
   - Use meaningful descriptions

2. **Maintainability**
   - Keep seed data in separate files
   - Document data relationships
   - Use constants for shared values
   - Follow naming conventions

3. **Performance**
   - Batch database operations
   - Use proper transaction management
   - Handle relationships efficiently
   - Minimize database roundtrips

4. **Development Support**
   - Support database reset option
   - Provide CLI interface
   - Include logging
   - Handle errors gracefully 