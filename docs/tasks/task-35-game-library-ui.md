# Task 35: Game Library UI Components

**Milestone**: 2 - MVP Core  
**Priority**: P0  
**Status**: To Do  
**Size**: M  
**Branch**: `feature/task-35-game-library-ui`

## Context & Background

You are working on the **Game Night Concierge** application, a modern web app that helps friends make better decisions about what board games to play on BoardGameArena.com. This is **Task 35** from **Milestone 2: MVP Core**, focusing on creating the game library user interface components.

**Essential Documentation - Please Review Before Starting:**
- `docs/decisions/mvp-game-curation-approach.md` - **CRITICAL**: Updated MVP strategy for curated game library
- `docs/implementation/task-30-game-library-api.md` - Backend API implementation details
- `docs/implementation/task-48-frontend-api-client.md` - Frontend API client usage patterns
- `docs/implementation/task-49-frontend-component-library.md` - Available UI components
- `docs/admin-interface/data-database-monitoring.md` - Real data structure and monitoring

## Getting Started

1. **Create new branch**: `feature/task-35-game-library-ui`
2. **Review essential documentation** listed above for context
3. **Study game curation strategy**: Understand curated vs. full game catalog approach
4. **Examine existing data**: Use `/data-demo` page to see real game data structure
5. **Test API integration**: Verify Games API endpoints work as expected
6. **Start with core components**: Build incrementally with real data

## Current Project State

**Tech Stack:**
- **Frontend**: Next.js 15.3.3 with App Router, TypeScript, Tailwind CSS
- **Component Library**: 22 components implemented with CVA variants and theming
- **API Integration**: Complete Games API client with advanced filtering
- **Data**: 1,082 BoardGameArena games imported (implementing curated subset approach)
- **Theme System**: CSS variables with light/dark mode support

**Existing Foundation:**
- ✅ Complete Games API with 8 endpoints including advanced filtering (Task #30)
- ✅ TypeScript API client with error handling and retry logic (Task #48)
- ✅ Comprehensive UI component library with theming (Task #49)
- ✅ Admin interface showing real game data structure (`/data-demo`)
- ✅ Real BoardGameArena data: 1,082 games with categories, play times, complexity

**Available Game Data Structure:**
```typescript
interface GameResponse {
  id: string;
  name: string;
  description?: string;
  min_players: number;
  max_players: number;
  average_play_time?: number;
  complexity_rating?: number;
  bga_id?: string;
  categories: GameCategoryResponse[];
  tags: GameTagResponse[];
  created_at: string;
  updated_at: string;
}
```

## Task Requirements

Implement a curated game library interface that showcases the most relevant games for our users while providing excellent user experience and setting the foundation for future expansion.

### Core Game Library Components

1. **GameLibraryPage** (`/games`)
   - Main game library interface
   - Implements curated game strategy (played games + similar games)
   - Integration with filtering and search
   - Responsive grid layout

2. **GameCard Component**
   - Visual game representation with key information
   - Player count, play time, complexity display
   - Category badges and visual indicators
   - Hover states and interaction feedback

3. **GameGrid Component**
   - Responsive grid layout for game cards
   - Loading states and empty states
   - Pagination or infinite scroll for performance
   - Grid size adaptation based on screen size

4. **GameSearch Component**
   - Real-time search with debouncing
   - Integration with Games API search endpoint
   - Search suggestions and autocomplete
   - Clear search functionality

5. **GameFilters Component**
   - Quick filter options (player count, complexity, play time)
   - Category-based filtering
   - Filter reset and clear functionality
   - Filter count indicators

## Implementation Requirements

### 1. Curated Game Strategy Implementation
Following `docs/decisions/mvp-game-curation-approach.md`:

**Primary Game Set:**
- Query games that our 4 real players have actually played
- Use existing game history data to identify relevant games
- Prioritize games with multiple plays or high engagement

**Similar Games Algorithm:**
- Select ~50 additional games similar to played games
- Use existing data: player count, complexity, categories
- Implement similarity scoring based on current attributes
- Ensure variety while maintaining relevance

**Backend Integration:**
```typescript
// Example API calls for curated library
const playedGames = await getGamesPlayedByUsers(['dandam', 'superoogie', 'permagoof', 'gundlach']);
const similarGames = await getGames({
  category_ids: extractCategoriesFromPlayedGames(playedGames),
  min_players: getMinPlayersRange(playedGames),
  max_players: getMaxPlayersRange(playedGames),
  limit: 50
});
```

### 2. Game Card Design Requirements

**Visual Hierarchy:**
- Game name (primary)
- Player count range (prominent)
- Play time (secondary)
- Complexity rating (visual indicator)
- Categories (badge chips)

**Interactive Elements:**
- Hover effects with game preview
- Click-through to game detail (modal or dedicated page)
- Favorite/bookmark functionality (future)
- Compatibility indicator when user preferences are set

**Responsive Design:**
- Mobile: Single column, compact cards
- Tablet: 2-3 columns, medium cards
- Desktop: 3-4 columns, full feature cards

### 3. Filtering & Search Integration

**API Integration:**
- Use existing Games API filtering endpoints
- Implement proper error handling and loading states
- Debounced search to prevent excessive API calls
- URL state management for shareable filtered views

**Filter Options:**
- **Player Count**: Quick buttons for common counts (2, 3, 4, 5, 6+)
- **Play Time**: Ranges (< 30min, 30-60min, 60-90min, 90min+)
- **Complexity**: Visual scale (1-5 stars/dots)
- **Categories**: Multi-select from available categories
- **Search**: Real-time text search with suggestions

### 4. Performance & UX Requirements

**Loading Strategy:**
- Initial load: Show curated game set (~100-150 games)
- Progressive loading if needed (pagination or infinite scroll)
- Skeleton loading states during API calls
- Optimistic updates for user interactions

**Error Handling:**
- Network error recovery with retry options
- Empty state for no results found
- Search suggestions when no matches
- Graceful degradation if API is unavailable

**Performance Targets:**
- Initial page load: < 2 seconds
- Filter operations: < 500ms response time
- Search results: < 300ms response time
- Smooth animations and transitions

## File Structure

```
frontend/src/app/games/
├── page.tsx                 # Main games library page
├── components/
│   ├── GameCard.tsx         # Individual game card component
│   ├── GameGrid.tsx         # Grid layout component
│   ├── GameSearch.tsx       # Search functionality
│   ├── GameFilters.tsx      # Filtering interface
│   ├── GameLibraryHeader.tsx # Page header with controls
│   └── EmptyState.tsx       # No results state
├── hooks/
│   ├── useGames.tsx         # Games data fetching hook
│   ├── useGameFilters.tsx   # Filter state management
│   └── useGameSearch.tsx    # Search functionality hook
└── types/
    └── games.ts             # Game-specific type definitions
```

## API Integration Requirements

### Games API Endpoints to Use

1. **GET /api/v1/games** - Main game listing with filtering
2. **GET /api/v1/games/search** - Search functionality
3. **GET /api/v1/games/count** - Result count for pagination
4. **GET /api/v1/games/{id}** - Individual game details

### Error Handling Strategy

```typescript
// Example error handling pattern
try {
  const games = await getGames(filterParams);
  setGames(games);
  setLoading(false);
} catch (error) {
  if (error instanceof ApiError) {
    setError(`Failed to load games: ${error.message}`);
  } else {
    setError('An unexpected error occurred');
  }
  setLoading(false);
}
```

## Acceptance Criteria

### 1. Core Game Library Interface
- [ ] `/games` route displays curated game library
- [ ] Game cards show essential information clearly
- [ ] Responsive grid layout works across all screen sizes
- [ ] Loading states display during API calls
- [ ] Error states handle network and API failures gracefully

### 2. Game Curation Implementation
- [ ] Displays games played by our 4 real users
- [ ] Shows ~50 additional similar games based on current data
- [ ] Implements similarity algorithm using existing game attributes
- [ ] Maintains performance with curated dataset
- [ ] Designed for future expansion to full catalog

### 3. Search Functionality
- [ ] Real-time search with debouncing (300ms delay)
- [ ] Integration with Games API search endpoint
- [ ] Search suggestions and autocomplete
- [ ] Clear search and reset functionality
- [ ] URL state updates for shareable searches

### 4. Filtering System
- [ ] Player count filtering with quick-select buttons
- [ ] Play time range filtering
- [ ] Complexity level filtering with visual indicators
- [ ] Category-based filtering with multi-select
- [ ] Filter combinations work correctly
- [ ] Filter reset and clear all functionality
- [ ] Active filter indicators and counts

### 5. Game Card Component
- [ ] Displays game name, player count, play time, complexity
- [ ] Shows game categories as badge chips
- [ ] Implements hover effects and interactivity
- [ ] Responsive design across screen sizes
- [ ] Click-through functionality (modal or navigation)
- [ ] Visual hierarchy and typography consistency

### 6. Performance & UX
- [ ] Initial page load under 2 seconds
- [ ] Filter operations under 500ms
- [ ] Search results under 300ms
- [ ] Smooth animations and transitions
- [ ] Skeleton loading states
- [ ] Optimistic UI updates

### 7. Integration Requirements
- [ ] Uses existing component library components
- [ ] Integrates with theme system (light/dark mode)
- [ ] Follows established TypeScript patterns
- [ ] Maintains existing API client patterns
- [ ] Compatible with Next.js App Router

### 8. Testing Requirements
- [ ] Unit tests for all components
- [ ] Integration tests for API calls
- [ ] User interaction tests
- [ ] Responsive design tests
- [ ] Accessibility tests (WCAG 2.1 AA)
- [ ] Error handling tests

## User Experience Flows

### Primary User Flow
1. User navigates to `/games`
2. Page loads with curated game library
3. User sees relevant games they might want to play
4. User can filter by player count for tonight's game night
5. User can search for specific games
6. User clicks on game card to see details
7. User finds perfect game for their group

### Secondary Flows
- Browse by category (Strategy, Card Games, etc.)
- Search for specific game name
- Filter by play time for available session length
- Filter by complexity for group skill level

## Domain-Specific Context

**Game Night Concierge User Goals:**
- Find games suitable for current group size
- Discover new games similar to favorites
- Quickly filter games by available time
- See games that match group preferences
- Avoid choice overload with curated selection

**Data Leverage:**
- Use real play history from 4 actual users
- Show games that have been successfully played
- Highlight games popular with similar groups
- Focus on BoardGameArena-available games

## Future Expansion Considerations

### BoardGameGeek Integration (Future Milestone)
- Component architecture should support richer game metadata
- Design system should accommodate game ratings and reviews
- Filtering system should be extensible for new data fields
- Performance should scale to larger datasets

### Advanced Features (Future)
- Game recommendations based on user preferences
- Compatibility scoring display
- Social features (played with friends)
- Game collection management
- Advanced analytics and insights

## Success Metrics

**User Engagement:**
- Time spent browsing game library
- Games clicked vs. games displayed
- Filter usage patterns
- Search success rates

**Technical Performance:**
- Page load times
- API response times
- Error rates
- User session duration

**Business Value:**
- Games discovered through library
- User retention in game browsing
- Successful game night outcomes
- User feedback on game selection

---

## Implementation Notes

**Start with Core Functionality:**
1. Basic game grid with real data
2. Simple filtering (player count, search)
3. Game card interactivity
4. Polish and performance optimization

**Build Incrementally:**
- Get basic library working with real data
- Add filtering one capability at a time
- Implement curated strategy after core functionality
- Polish UX and performance in final iteration

**Testing Strategy:**
- Test with real BoardGameArena data
- Verify filtering works with actual game catalog
- Validate responsive design across devices
- Test error conditions and recovery

This task creates the foundation for game discovery in the Game Night Concierge MVP while setting up for future expansion and enhanced functionality. 