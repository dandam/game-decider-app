# Database Seeding System

## Overview

The seeding system is designed to populate the database with sample data for development and testing purposes. It follows a modular approach with individual seeders for different data types, coordinated by a central runner.

## Architecture

### Core Components

1. **Base Seeder**
   - Abstract base class for all seeders
   - Handles common functionality and database session management
   - Supports async operations

2. **Individual Seeders**
   - `GameCategoriesSeeder`: Seeds game categories (Strategy, Party, etc.)
   - `GameTagsSeeder`: Seeds game tags (Family Friendly, Quick Play, etc.)
   - `GamesSeeder`: Seeds sample games with relationships
   - `PlayersSeeder`: Seeds player profiles with preferences and history

3. **CLI Interface**
   - Uses Typer for command-line interface
   - Supports `--reset` flag for database reset before seeding
   - Handles async operations properly

## Data Structure

### Sample Data

1. **Game Categories**
   - Strategy, Party, Cooperative, Deck Building, etc.
   - Each with name and description

2. **Game Tags**
   - Family Friendly, Quick Play, Heavy Strategy, etc.
   - Each with name and description

3. **Games**
   - Sample games like Catan, Pandemic, etc.
   - Includes relationships to categories and tags
   - Contains metadata like player counts and complexity

4. **Players**
   - Sample players with preferences and game history
   - Includes randomly generated preferences
   - Contains sample play history with ratings and notes

## Issues Encountered and Solutions

### 1. Circular Import Issues
**Problem**: Models had circular dependencies due to relationship imports.
**Solution**: 
- Moved association tables to a separate `associations.py` module
- Used string references for forward declarations in relationships
- Example: `Mapped[List["GameCategory"]]` instead of `Mapped[List[GameCategory]]`

### 2. SQLAlchemy Import Issues
**Problem**: Linter errors with SQLAlchemy imports like `mapped_column`.
**Solution**:
- Ensured correct SQLAlchemy version in requirements.txt
- Used string-based relationship definitions
- Properly structured model imports

### 3. CLI Command Structure
**Problem**: Typer command not being recognized properly.
**Solution**:
- Added callback to main CLI app
- Created proper module structure with `__main__.py`
- Fixed command registration and argument handling

### 4. Database Driver Issues
**Problem**: Async operations failing with psycopg2 driver.
**Solution**:
- Updated DATABASE_URL to use asyncpg driver
- Format: `postgresql+asyncpg://user:pass@host:port/db`
- Added proper async session management

### 5. Data Relationships
**Problem**: Complex relationships between models needed careful seeding order.
**Solution**:
- Implemented ordered seeding sequence
- Used proper relationship cascade settings
- Added proper foreign key constraints

## Running Seeds

### Basic Usage
```bash
# Run seeds with existing data
python -m app.cli seed

# Reset database and run seeds
python -m app.cli seed --reset
```

### Docker Environment
```bash
# Run seeds in Docker environment
docker compose exec backend python -m app.cli seed --reset
```

## Best Practices

1. **Data Generation**
   - Use realistic but sanitized data
   - Generate random variations for testing
   - Maintain referential integrity

2. **Error Handling**
   - Proper exception handling in seeders
   - Graceful failure with helpful messages
   - Transaction management for data consistency

3. **Maintenance**
   - Keep seed data up to date with schema changes
   - Document any special requirements or dependencies
   - Use type hints and docstrings for clarity

## Future Improvements

1. **Data Validation**
   - Add validation for generated data
   - Ensure realistic value ranges
   - Check relationship constraints

2. **Performance**
   - Batch inserts for better performance
   - Optimize relationship handling
   - Add progress indicators for long operations

3. **Testing**
   - Add tests for seeders
   - Verify data integrity
   - Test edge cases and error conditions 