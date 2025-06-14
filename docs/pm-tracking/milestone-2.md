# Milestone 2: MVP Core

Sprint 2 focuses on implementing the core functionality of the application, including player profiles, game library, and basic filtering engine. This milestone establishes the foundational data models and business logic that will support future features.

## Research Spikes

Before beginning implementation, we need to complete these research spikes to inform our technical decisions:

### Spike 1: Theming Strategy (2-3 days)
- Compare CSS variables + Tailwind vs. CSS-in-JS approaches
- Evaluate theme provider patterns and component library impact
- Create small POC for chosen approach
- Document findings and recommendations

### Spike 2: Analytics Architecture (2-3 days)
- Research skill vs. preference scoring models
- Define core metrics for tracking
- Design flexible schema for future analytics
- Document data model recommendations

### Spike 3: BoardGameArena Integration (3-4 days)
- Document API access rules and rate limits
- Map available data fields
- Test authentication flow
- Create sample data payload
- Document integration approach

## Tasks

| Issue # | Title | Priority | Status | Size |
|---------|-------|----------|--------|------|
| 23 | Complete theming strategy spike | P0 | Done | S |
| 24 | Complete analytics architecture spike | P0 | To Do | S |
| 25 | Complete BoardGameArena integration spike | P0 | Done | M |
| 26 | Process collected BGA data into structured format | P1 | Done | M |
| 27 | Refactor and align technical approach based on spike outcomes | P0 | To Do | M |
| 28 | Design and implement core database tables | P0 | Done | M |
| 29 | Create player profile models and API | P0 | Done | M |
| 30 | Implement game library models and API | P0 | In Done | M |
| 31 | Create player preferences models and API | P0 | Done | M |
| 32 | Set up database migrations with Alembic | P0 | Done | S |
| 33 | Create data seeding system for development | P1 | Done | S |
| 34 | Implement player profile UI components | P0 | To Do | M |
| 35 | Create game library UI components | P0 | To Do | M |
| 36 | Implement basic game filtering | P0 | To Do | M |
| 37 | Create game detail view | P1 | To Do | M |
| 38 | Implement player preferences UI | P0 | To Do | M |
| 39 | Add basic game statistics display | P1 | To Do | S |
| 40 | Create game compatibility indicators | P0 | To Do | M |
| 41 | Implement responsive layout for all views | P0 | To Do | M |
| 42 | Add form validation and error handling | P0 | To Do | M |
| 43 | Create comprehensive API documentation | P1 | To Do | S |
| 44 | Write player-related integration tests | P0 | To Do | M |
| 45 | Implement relationship tables and constraints | P0 | Done | M |
| 46 | Create advanced game matching logic | P0 | To Do | M |
| 47 | Write game-related integration tests | P0 | To Do | M |
| 48 | Set up frontend API client and services | P0 | Done | M |
| 49 | Create frontend component library | P1 | To Do | M |
| 50 | Implement loading and error states | P0 | To Do | M |
| 51 | Set up frontend state management | P0 | To Do | M |
| 52 | Create Pydantic validation schemas | P0 | Done | S |

## Task Dependencies and Sequencing

0. Research Spikes (Sprint 2.0)
   - #23 Theming strategy - Done
   - #24 Analytics architecture 
   - #25 BoardGameArena integration - Done
   - #26 Process BGA data - Done
   - #27 Technical alignment and refactoring

1. Core Data Layer (Sprint 2.1)
   - #28 Core database tables - Done
   - #45 Relationship tables - Done
   - #52 Pydantic validation schemas - Done
   - #32 Alembic migrations - Done
   - #33 Data seeding - Done

2. Backend APIs (Sprint 2.1)
   - #29 Player profiles API - Done
   - #30 Game library API - Done
   - #31 Player preferences API - Done
   - #42 Form validation and error handling

3. Frontend Foundation (Sprint 2.1)
   - #48 API client setup - Done
   - #49 Frontend component library
   - #51 Frontend state management
   - #50 Loading and error states

4. Frontend Features (Sprint 2.2)
   - #34 Player profile UI
   - #35 Game library UI
   - #38 Player preferences UI
   - #41 Responsive layout

5. Game Logic (Sprint 2.2)
   - #36 Basic filtering
   - #46 Advanced game matching
   - #40 Game compatibility indicators
   - #39 Basic game statistics
   - #37 Game detail view

6. Quality Assurance (Throughout)
   - #43 API documentation
   - #44 Player-related integration tests
   - #47 Game-related integration tests

## Database Schema Overview

### Player Profile
- UUID
- Username
- Display Name
- Avatar URL
- Created At
- Updated At
- Preferences (1:1 relation)
- Game History (1:M relation)

### Game
- UUID
- Name
- Description
- Min Players
- Max Players
- Average Play Time
- Complexity Rating
- Categories (M:M relation)
- Tags (M:M relation)
- Created At
- Updated At

### PlayerPreferences
- UUID
- Player ID (FK)
- Minimum Play Time
- Maximum Play Time
- Preferred Player Count
- Preferred Categories (M:M relation)
- Preferred Complexity Range
- Created At
- Updated At

### GameCategory
- UUID
- Name
- Description

### GameTag
- UUID
- Name
- Description

### PlayerGameHistory
- UUID
- Player ID (FK)
- Game ID (FK)
- Play Date
- Rating
- Notes
- Created At

## API Endpoints

### Player Profiles
- GET /api/v1/players
- GET /api/v1/players/{id}
- POST /api/v1/players
- PUT /api/v1/players/{id}
- DELETE /api/v1/players/{id}

### Games
- GET /api/v1/games
- GET /api/v1/games/{id}
- POST /api/v1/games
- PUT /api/v1/games/{id}
- DELETE /api/v1/games/{id}
- GET /api/v1/games/search
- GET /api/v1/games/filter

### Preferences
- GET /api/v1/players/{id}/preferences
- PUT /api/v1/players/{id}/preferences
- GET /api/v1/games/{id}/compatibility

## Frontend Routes

- /players
- /players/{id}
- /players/{id}/preferences
- /games
- /games/{id}
- /games/search

## Testing Strategy

1. Unit Tests
   - Data models and validation
   - Filtering engine logic
   - UI components
   - Form validation

2. Integration Tests
   - API endpoints
   - Database operations
   - Frontend-backend integration
   - User flows

3. End-to-End Tests
   - Player profile creation and editing
   - Game library browsing and filtering
   - Preference management
   - Search functionality

## Definition of Done

- Feature implemented and tested
- Documentation updated
- Integration tests passing
- UI responsive and accessible
- Code reviewed and approved
- No regressions in existing functionality
- Performance metrics within acceptable range 

## Progress Notes

### Research Spikes Progress
- ✅ Theming Strategy Spike (Issue #23)
  - Implemented CSS variables + Tailwind approach
  - Created theme provider and toggle components
  - Set up dark mode support
  - Documented approach in frontend README
  - Created theme demo page
  - TODO: Add visual references for layout
- 🏗 Analytics Architecture Spike (Issue #24)
  - Planning phase
- ✅ BoardGameArena Integration Spike (Issue #25)
  - Completed

### Core Data Layer Progress
- ✅ Core Database Tables (Issue #28)
  - Implemented SQLAlchemy models for Player and Game
  - Set up base model with common fields (UUID, timestamps)
  - Added initial fields for core entities
  - TODO: Add remaining relationship models
- ✅ Database Migrations (Issue #32)
  - Set up Alembic for database migrations
  - Created initial migration for core tables
  - Configured async PostgreSQL support
  - TODO: Add seed data migration
- 🏗 Player Profile API (Issue #29)
  - Models implemented
  - TODO: Add API endpoints and services
- 🏗 Game Library API (Issue #30)
  - Models implemented
  - TODO: Add API endpoints and services
- ✅ Player Preferences API (Issue #31)
  - Repository layer implemented with CRUD operations
  - API endpoints added: GET/PUT preferences, GET compatibility
  - CompatibilityService with sophisticated scoring algorithm
  - Comprehensive test coverage for all components
  - Many-to-many category relationships working
  - All validation and error handling implemented

### Issue 26 Progress (Technical Alignment)
- 🏗 Planning Phase
- [ ] Review spike outcomes and recommendations
- [ ] Identify necessary architectural adjustments
- [ ] Update technical design documents
- [ ] Refine implementation approach
- [ ] Update task dependencies if needed
- [ ] Document final technical decisions

## Task Details

### Task 25: Complete BoardGameArena integration spike
- ✅ Investigated API availability and access methods
- ✅ Successfully collected sample data for all required areas:
  - Game catalog with IDs
  - Player profiles and statistics
  - Recent game history
  - Player avatars
- ✅ Created data organization structure
- ✅ Documented findings in `docs/spikes/bga-data-access.md`
- ✅ Conclusion: Manual data collection viable for MVP
- 👉 Next steps moved to Task 26

### Task 26: Process collected BGA data into structured format
- Extract and normalize game catalog
- Process player profiles and statistics
- Transform match history into structured format
- Implement data validation
- Create reproducible processing pipeline
- Document data structures and relationships 
