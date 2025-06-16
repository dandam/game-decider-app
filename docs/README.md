# Game Night Concierge Documentation

This directory contains all project documentation for the Game Night Concierge application.

## Directory Structure

- `architecture-overview.md` - High-level system architecture
- `game-night-concierge-prd.md` - Product Requirements Document
- `data-layer/` - Database schema and data model documentation
- `admin-interface/` - **System administration and monitoring interface documentation**
- `pm-tracking/` - Project management and milestone tracking
- `spikes/` - Research spike documentation and findings
- `tasks/` - Individual task specifications and requirements
- `implementation/` - Task implementation documentation (for PR summaries)
- `testing/` - Testing strategies and documentation
- `rules-drafts/` - Game recommendation algorithm drafts

## Task Completion Process

**IMPORTANT**: All tasks require PM (Dan) sign-off before being considered complete.

### Implementation Documentation
- All task implementations must be documented in `docs/implementation/`
- Documentation should be suitable for copy/paste as GitHub PR summaries
- Include technical details, challenges resolved, and acceptance criteria met
- Format: `task-{number}-{brief-description}.md`

### Routing Documentation
- **Critical**: All routing decisions and architecture must be clearly documented
- Frontend uses Next.js 15 App Router exclusively - NO Pages Router
- Any routing conflicts or issues should be documented to prevent recurrence

## Key Documentation Files

- [Architecture Overview](architecture-overview.md)
- [Product Requirements](game-night-concierge-prd.md)
- [Data Layer Design](data-layer.md)
- [Admin Interface & System Monitoring](admin-interface/README.md) - **Production-ready monitoring dashboard**
- [Milestone 2 Tracking](pm-tracking/milestone-2.md)

## Contributing

When adding new documentation:
1. Use clear, descriptive filenames
2. Follow markdown best practices
3. Include a table of contents for longer documents
4. Update this README with new entries
5. Link related documents where appropriate 