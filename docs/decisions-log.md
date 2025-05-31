# 📝 Technical Decisions Log

This document tracks significant technical and architectural decisions made during the development of Game Night Concierge. Each decision is recorded with context, options considered, and rationale for the chosen approach.

## Decision Format
Each decision should include:
- Date
- Context/Background
- Options Considered
- Decision Made
- Rationale
- Implications
- Status (Active/Superseded/Deprecated)

---

## Decisions

### 1. Container Strategy for Database Management (2024-03-XX)

**Context:**
- Project requires PostgreSQL database
- Need to determine whether to run database in separate container or within application container
- Development and production environments have different requirements
- Project scale is relatively small (4 users, limited data)

**Options Considered:**

1. **Separate Container Approach**
   - PostgreSQL runs in dedicated container
   - Managed via docker-compose
   - Clear separation of services
   
   Pros:
   - Clear separation of concerns
   - Easy database management (reset/rebuild)
   - Matches common development patterns
   - Flexible for future scaling
   - Simple to switch to external DB if needed
   - Can use official PostgreSQL image directly
   
   Cons:
   - More complex container orchestration
   - Slightly higher resource overhead
   - More complex deployment

2. **Single Container Approach**
   - PostgreSQL installed within backend container
   - All services in one container
   
   Pros:
   - Simpler deployment
   - Lower resource overhead
   - Easier initial setup
   
   Cons:
   - Less flexible
   - Harder to maintain/backup
   - Mixing service concerns
   - More complex container builds

**Decision:**
- Development: Use separate containers (backend, frontend, db) managed by docker-compose
- Production: Start with separate containers, with option to consolidate if resource constraints become issue

**Rationale:**
1. Development benefits:
   - Better local development experience
   - Easier testing and data management
   - More realistic service boundary simulation
   - Flexibility to modify configuration
   
2. Production considerations:
   - Starting with separate containers maintains consistency with development
   - Can optimize later if needed
   - Small overhead is acceptable for benefits gained

**Implications:**
- Need to maintain docker-compose configuration
- Need to document container management procedures
- May need to revisit decision if production resources become constraint
- Backup procedures should account for separate database container

**Status:** Active

### 2. Docker Operational Procedures (2024-03-XX)

**Context:**
- Need consistent procedures for Docker operations
- Database verification requires specific command flags
- Container management needs clear documentation

**Key Procedures:**

1. **Starting Docker Services**
   ```bash
   # Detached mode (recommended for development)
   docker compose up --build -d   # Runs containers in background
   
   # Interactive mode (for debugging)
   docker compose up --build      # Shows live logs in terminal
   ```
   
   Pros of detached mode:
   - Frees up terminal for other commands
   - Easier to run verification commands
   - Can still access logs via `docker compose logs`
   
   Cons of detached mode:
   - Need extra command to view logs
   - May miss immediate startup issues

2. **Database Verification Commands**
   ```bash
   # List databases (with pagination disabled)
   docker compose exec db psql -U postgres -c "\l" --no-psqlrc -P pager=off
   
   # Connect to specific database
   docker compose exec db psql -U postgres -d game_night_dev --no-psqlrc -P pager=off
   ```
   
   Important flags:
   - `--no-psqlrc`: Prevents loading user's psql configuration
   - `-P pager=off`: Disables interactive pagination
   - These flags ensure clean, non-interactive output

3. **Container Management**
   ```bash
   # View container status
   docker compose ps
   
   # View container logs
   docker compose logs [service_name]
   
   # Restart specific service
   docker compose restart [service_name]
   
   # Shutdown procedures
   docker compose down              # Stop and remove containers, networks
   docker compose down -v           # Also remove volumes (deletes database data)
   docker compose down --rmi all    # Also remove all images
   ```
   
   Shutdown options:
   - Basic down: Preserves data volumes and images
   - With `-v`: Removes volumes (fresh start)
   - With `--rmi all`: Complete cleanup
   
   Best practices:
   - Use basic `down` for temporary shutdown
   - Use `-v` when you need to reset database state
   - Use `--rmi all` when you need to rebuild from scratch

**Rationale:**
- Clear procedures reduce debugging time
- Non-interactive commands are better for scripts and CI/CD
- Consistent flags ensure reproducible behavior

**Implications:**
- Team members should follow these procedures
- CI/CD scripts should use these non-interactive flags
- Documentation should be updated if better practices are discovered

**Status:** Active

---

## Template for New Decisions

### Title (YYYY-MM-DD)

**Context:**
- Background information
- Problem being solved
- Constraints and requirements

**Options Considered:**
1. Option 1
   - Details
   - Pros
   - Cons
   
2. Option 2
   - Details
   - Pros
   - Cons

**Decision:**
- What was decided

**Rationale:**
- Why this decision was made
- Key factors considered

**Implications:**
- What becomes easier/harder
- Follow-up actions needed
- Risks to monitor

**Status:** Active/Superseded/Deprecated 