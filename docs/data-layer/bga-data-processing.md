# BoardGameArena Data Processing

## Overview

The BGA data processing system imports real BoardGameArena data into our database, providing authentic game and player information for the Game Night Concierge application.

## Architecture

### Core Components

1. **BGA Processor** (`app/data_processing/bga_processor.py`)
   - Main processor for games, players, and aggregate statistics
   - Handles HTML parsing and JSON data extraction
   - Imports data into SQLAlchemy models

2. **Player Stats Parser** (`app/data_processing/player_stats_parser.py`)
   - Extracts detailed game statistics from HTML profile pages
   - Parses game-specific data (ELO ratings, win rates, games played)
   - Outputs structured JSON for further processing

3. **Session Processor** (`app/data_processing/session_processor.py`)
   - Processes multi-player game session data
   - Handles head-to-head matchups between core players
   - Future-ready for when BGA session data is collected

## Data Sources

### Raw Data Structure
```
data/raw/
├── games-bga/
│   └── game-list-and-IDs.html          # Complete BGA game catalog
├── player-profiles/
│   ├── dandam/
│   │   ├── dandam-profile.html         # Profile with game statistics
│   │   └── dandam-avatar.jpg           # Local avatar image
│   ├── superoogie/
│   ├── permagoof/
│   └── gundlach/
└── player-stats/
    ├── dandam/
    │   ├── dandam-may-2025-stats.json  # Game history data
    │   └── dandam-extracted-stats.json # Processed statistics
    ├── superoogie/
    ├── permagoof/
    └── gundlach/
```

## Data Processing Pipeline

### 1. Game Catalog Import
- **Source**: `data/raw/games-bga/game-list-and-IDs.html`
- **Process**: Parses HTML select options to extract game IDs and names
- **Output**: 1,082+ games imported into `games` table
- **Key Fields**: `bga_game_id`, `name`, `min_players`, `max_players`

### 2. Player Profile Processing
- **Source**: `data/raw/player-profiles/{player}/{player}-profile.html`
- **Process**: 
  - Extracts BGA username from profile HTML
  - Uses local avatar files instead of external URLs
  - Parses overall player statistics
- **Output**: Player records in `players` table
- **Avatar Strategy**: Local paths (`/avatars/{player}-avatar.jpg`)

### 3. Game Statistics Extraction
- **Source**: Player profile HTML files
- **Process**: 
  - Parses `palmares_game` sections for detailed game stats
  - Extracts games played, victories, win percentages, ELO ratings
  - Handles different game types and scoring systems
- **Output**: Structured JSON files with game-by-game statistics

### 4. Aggregate Game History Import
- **Source**: Extracted player statistics
- **Process**: 
  - Converts aggregate stats to game history records
  - Creates one record per player per game
  - Uses calculated ratings based on win percentages
- **Output**: Records in `player_game_history` table

## CLI Commands

### Process BGA Data
```bash
# Import games, players, and aggregate statistics
docker compose exec backend python -m app.cli process-bga --data-path /app/data
```

### Extract Player Statistics
```bash
# Parse detailed game stats from HTML profiles
docker compose exec backend python -m app.cli extract-player-stats --data-path /app/data
```

### Process Session Data (Future)
```bash
# Import multi-player session data when available
docker compose exec backend python -m app.cli process-sessions --data-path /app/data
```

## Data Quality & Validation

### Current Data Status
- **Games**: 1,082 BoardGameArena games imported
- **Players**: 4 core players (dandam, superoogie, permagoof, gundlach)
- **Game History**: 390+ aggregate statistics records
- **Avatars**: All using local image files

### Data Integrity Features
- **Duplicate Prevention**: Checks for existing records before import
- **Error Handling**: Graceful failure with detailed error reporting
- **Transaction Safety**: Database rollback on errors
- **Data Validation**: Type checking and format validation

## Key Design Decisions

### 1. Local Avatar Storage
**Decision**: Use local avatar files instead of external BGA URLs
**Rationale**: 
- Avoid external dependencies
- Ensure consistent availability
- Respect BGA's terms of service

### 2. Aggregate vs Individual Game Records
**Decision**: Import aggregate statistics rather than individual game plays
**Rationale**:
- Available data is aggregate-focused
- Sufficient for recommendation algorithms
- Placeholder for future detailed session data

### 3. Flexible JSON Storage
**Decision**: Store metadata in JSON fields for extensibility
**Rationale**:
- Accommodate varying BGA data structures
- Future-proof for additional data fields
- Maintain processing history

## Future Enhancements

### 1. Real-time Session Data
- Import individual game sessions with detailed player interactions
- Track head-to-head performance between core players
- Enable advanced analytics and recommendations

### 2. Automated Data Collection
- Scheduled data updates from BGA
- Incremental imports for new games and statistics
- Data freshness monitoring

### 3. Enhanced Analytics
- Player preference learning from game history
- Game recommendation algorithms
- Performance trend analysis

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   # Install BeautifulSoup4 if missing
   docker compose exec backend pip install beautifulsoup4
   ```

2. **Data Directory Not Mounted**
   ```bash
   # Ensure data directory is mounted in docker-compose.yml
   volumes:
     - ./data:/app/data
   ```

3. **Database Connection Issues**
   ```bash
   # Check database container status
   docker compose ps
   docker compose restart db
   ```

### Data Validation
```bash
# Check imported data counts
docker compose exec db psql -U postgres -d game_night_dev -c "
  SELECT 
    (SELECT COUNT(*) FROM games) as games,
    (SELECT COUNT(*) FROM players) as players,
    (SELECT COUNT(*) FROM player_game_history) as game_history;
"
```

## Performance Considerations

- **Batch Processing**: Large datasets processed in chunks
- **Memory Management**: Streaming JSON parsing for large files
- **Database Optimization**: Proper indexing on lookup fields
- **Error Recovery**: Partial import capability with resume functionality 