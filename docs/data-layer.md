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
- Async migrations support
- Separate dev/test/prod configurations
- Data seeding support
- Rollback support

### Migration Patterns
- One change per migration
- Reversible migrations
- Data migration helpers
- Constraint handling

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