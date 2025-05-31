# Project Management Tracking

This directory contains milestone-based task tracking for the Game Night Concierge project. Each milestone is tracked in its own markdown file with a consistent structure.

## File Structure
- `README.md` - This file, containing tracking guidance
- `milestone-1.md` - Sprint 1: Project Scaffold
- Additional milestone files will be added as the project progresses

## Task Tracking Format
Each milestone file contains a table with the following columns:

| Column | Description |
|--------|-------------|
| Issue # | Consecutive number across all milestones (does not restart) |
| Title | Succinct description of the task |
| Priority | P0 (Must have/blocking), P1 (Should have), P2 (Nice to have) |
| Status | One of: Backlog, To Do, In Progress, Won't Do, Complete |
| Size | T-shirt sizes (XS, S, M, L, XL) |

## Priority Definitions
- **P0**: Must have for this milestone/sprint (blocking)
  - Critical infrastructure
  - Core functionality
  - Blocking dependencies
- **P1**: Should have for this milestone/sprint
  - Important features
  - Non-blocking requirements
  - Key user experience elements
- **P2**: Nice to have for this milestone/sprint
  - Polish and refinements
  - Optional features
  - Future preparation

## Status Definitions
- **Backlog**: Task identified but not yet ready for work
- **To Do**: Task is ready to be worked on
- **In Progress**: Work has started on this task
- **Won't Do**: Task has been determined to be unnecessary or out of scope
- **Complete**: Task has been finished and meets acceptance criteria

## Development Philosophy
As outlined in the PRD:
- Build small, ship often
- Work in 2-week sprints
- Focus on modular code that enables easy feature growth
- Prioritize security and test coverage
- Maintain a player-first mindset

## Workflow
1. Tasks are initially added to milestone files in 'Backlog' status
2. Tasks are moved to 'To Do' when ready for development
3. Status is updated as work progresses
4. Tasks may be exported to GitHub Issues as needed

## Notes
- Issue numbers are consecutive across all milestones
- Priority and size should be assigned at task creation
- Status should be updated as work progresses
- Tasks can be exported to GitHub Issues for more detailed tracking if desired 