# Game Sessions Data Model

## Overview

The Game Sessions system tracks multi-player games between our core players, enabling analysis of head-to-head performance, group dynamics, and competitive patterns.

## Data Model

### GameSession Entity

The `GameSession` model represents a single multi-player game session with detailed player performance data.

```python
class GameSession(Base):
    """Multi-player game session between core players."""
    
    # Identifiers
    id: UUID                    # Primary key
    bga_table_id: str          # BoardGameArena table ID (unique)
    bga_game_id: str           # BoardGameArena game ID
    
    # Game Information
    game_name: str             # Human-readable game name
    play_date: datetime        # When the game was played
    
    # Player Data (in ranking order: winner first, loser last)
    player_ids: List[str]      # BGA player IDs
    player_names: List[str]    # BGA usernames
    scores: List[int]          # Final scores
    rankings: List[int]        # Final rankings (1st, 2nd, etc.)
    
    # Optional Metadata
    game_duration_minutes: int # Game duration
    notes: str                 # Additional notes
    bga_metadata: dict         # Flexible BGA-specific data
```

### Key Design Principles

1. **Ranking Order**: All arrays are sorted by final ranking (winner first)
2. **Flexible Storage**: JSON fields accommodate varying game data structures
3. **BGA Integration**: Native support for BoardGameArena identifiers
4. **Extensibility**: Metadata fields for future enhancements

## Data Structure Examples

### 4-Player Catan Game
```json
{
  "bga_table_id": "table_1000001",
  "bga_game_id": "13",
  "game_name": "Catan",
  "play_date": "2025-06-08T19:14:32Z",
  "player_names": ["dandam", "superoogie", "permagoof", "gundlach"],
  "scores": [12, 10, 8, 7],
  "rankings": [1, 2, 3, 4],
  "game_duration_minutes": 85,
  "notes": "Close game, dandam won with longest road"
}
```

### 2-Player Splendor Game
```json
{
  "bga_table_id": "table_1000042",
  "bga_game_id": "1606",
  "game_name": "Splendor",
  "play_date": "2025-06-08T19:14:32Z",
  "player_names": ["gundlach", "permagoof"],
  "scores": [15, 12],
  "rankings": [1, 2],
  "game_duration_minutes": 45
}
```

### Cooperative Pandemic Game
```json
{
  "bga_table_id": "table_1000023",
  "bga_game_id": "1606",
  "game_name": "Pandemic",
  "play_date": "2025-06-08T19:14:32Z",
  "player_names": ["dandam", "superoogie", "permagoof", "gundlach"],
  "scores": [1, 1, 1, 1],
  "rankings": [1, 2, 3, 4],
  "notes": "Team victory - saved the world!"
}
```

## Database Schema

### Table Structure
```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY,
    bga_table_id VARCHAR(50) UNIQUE NOT NULL,
    bga_game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(200) NOT NULL,
    play_date TIMESTAMP NOT NULL,
    player_ids JSON NOT NULL,
    player_names JSON NOT NULL,
    scores JSON NOT NULL,
    rankings JSON NOT NULL,
    game_duration_minutes INTEGER,
    notes TEXT,
    bga_metadata JSON,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX ix_game_sessions_bga_table_id ON game_sessions(bga_table_id);
CREATE INDEX ix_game_sessions_bga_game_id ON game_sessions(bga_game_id);
```

## Seeding System

### GameSessionsSeeder

The seeder generates realistic placeholder data for development and testing:

```python
class GameSessionsSeeder(BaseSeed):
    """Seeds game sessions between core players."""
    
    PLAYERS = ["dandam", "superoogie", "permagoof", "gundlach"]
    
    SAMPLE_GAMES = [
        {"name": "Catan", "bga_id": "13"},
        {"name": "Splendor", "bga_id": "1606"},
        {"name": "Pandemic", "bga_id": "1606"},
        # ... more games
    ]
```

### Generated Data Characteristics

- **50 game sessions** over 6 months
- **2-4 players** per session (random combinations)
- **Realistic scoring** based on game type
- **Varied player combinations** to test all scenarios
- **Different game types** (competitive, cooperative, scoring systems)

## Data Processing Pipeline

### Current State: Placeholder Data
The seeder creates realistic test data for development:

```bash
# Generate 50 placeholder game sessions
docker compose exec backend python -m app.cli seed --reset
```

### Future State: BGA Session Import
When real BGA session data becomes available:

```bash
# Import actual multi-player session data
docker compose exec backend python -m app.cli process-sessions --data-path /app/data
```

### Session Processor Features

1. **Core Player Detection**: Identifies sessions with 2+ core players
2. **Data Validation**: Ensures data integrity and format consistency
3. **Duplicate Prevention**: Avoids importing the same session twice
4. **Error Handling**: Graceful failure with detailed error reporting

## Analytics Capabilities

### Player Performance Analysis

```python
# Get player's win rate against specific opponents
def get_head_to_head_stats(player1: str, player2: str) -> dict:
    sessions = session.query(GameSession).filter(
        GameSession.player_names.contains([player1, player2])
    ).all()
    
    player1_wins = sum(1 for s in sessions if s.get_player_rank(player1) < s.get_player_rank(player2))
    return {
        "total_games": len(sessions),
        "player1_wins": player1_wins,
        "player2_wins": len(sessions) - player1_wins
    }
```

### Game-Specific Performance

```python
# Get player performance in specific games
def get_game_performance(player: str, game_name: str) -> dict:
    sessions = session.query(GameSession).filter(
        GameSession.game_name == game_name,
        GameSession.player_names.contains([player])
    ).all()
    
    wins = sum(1 for s in sessions if s.get_player_rank(player) == 1)
    return {
        "games_played": len(sessions),
        "wins": wins,
        "win_rate": wins / len(sessions) if sessions else 0
    }
```

## Model Methods

### Convenience Properties

```python
# GameSession model methods
@property
def winner(self) -> str:
    """Get the winner's username (first in ranking order)."""
    return self.player_names[0] if self.player_names else ""

@property
def player_count(self) -> int:
    """Get the number of players in this session."""
    return len(self.player_names) if self.player_names else 0

def get_player_rank(self, player_name: str) -> Optional[int]:
    """Get the ranking (1-based) for a specific player."""
    try:
        index = self.player_names.index(player_name)
        return self.rankings[index]
    except (ValueError, IndexError):
        return None

def get_player_score(self, player_name: str) -> Optional[int]:
    """Get the score for a specific player."""
    try:
        index = self.player_names.index(player_name)
        return self.scores[index]
    except (ValueError, IndexError):
        return None
```

## Future Enhancements

### 1. Advanced Analytics
- **ELO Rating System**: Track skill progression over time
- **Matchup Analysis**: Identify favorable/unfavorable player combinations
- **Game Preference Learning**: Understand which games players excel at

### 2. Real-time Data Integration
- **Live Session Tracking**: Import sessions as they complete
- **Webhook Integration**: Automatic updates from BoardGameArena
- **Data Freshness Monitoring**: Ensure data stays current

### 3. Enhanced Metadata
- **Game Variants**: Track different game modes and expansions
- **Session Context**: Tournament vs casual play
- **Player Roles**: Track specific roles in asymmetric games

### 4. Performance Optimization
- **Materialized Views**: Pre-computed analytics for common queries
- **Caching Layer**: Redis caching for frequently accessed statistics
- **Batch Analytics**: Scheduled computation of complex metrics

## Data Validation

### Current Validation Checks
```bash
# Verify game sessions data
docker compose exec db psql -U postgres -d game_night_dev -c "
  SELECT 
    COUNT(*) as total_sessions,
    COUNT(DISTINCT game_name) as unique_games,
    AVG(array_length(player_names, 1)) as avg_players_per_game,
    MIN(play_date) as earliest_game,
    MAX(play_date) as latest_game
  FROM game_sessions;
"
```

### Data Quality Metrics
- **Session Completeness**: All required fields populated
- **Player Consistency**: Valid player names from core player set
- **Ranking Integrity**: Rankings match array lengths and are sequential
- **Score Validity**: Scores are appropriate for game type 