# Processed Data

This directory contains processed data extracted from the raw BoardGameArena (BGA) data files. The data is organized into three main categories:

## Directory Structure

- `games/` - Normalized game information
  - Game IDs, names, and metadata
  - No player-specific information
  
- `players/` - Player profile information
  - Basic profile data
  - Aggregate statistics
  - Game preferences and history summaries
  
- `matches/` - Individual game session data
  - Game results
  - Player participation and performance
  - Temporal data (duration, date/time)

## Processing Approach

1. Data is extracted from raw HTML and JSON files
2. Only data relevant to our 4 players is included
3. Files are processed incrementally and can be regenerated from raw sources
4. Each processed file includes metadata about its source and processing date
5. Data is organized to support our core features:
   - Game recommendations
   - Player preferences
   - Session history
   - Performance tracking

## File Formats

All processed data will be stored in JSON format with consistent structure within each category. The exact schema will evolve based on our application needs but will maintain backward compatibility. 