# Git Branching Strategy

## Overview
This document outlines our Git branching strategy to maintain a clean, organized, and efficient development workflow.

## Main Branches

- `main` - The primary branch containing production-ready code
- `develop` (if needed in future) - Integration branch for feature testing before production

## Feature Branches

### Naming Convention
Feature branches should follow the format: `feature/issue-description`

Examples:
- `feature/eslint-prettier-setup`
- `feature/python-linters-setup`
- `feature/frontend-tests-setup`
- `feature/backend-tests-setup`
- `feature/github-actions`
- `feature/error-handling`
- `feature/logging-setup`

### Branch Lifecycle

1. **Creation**: Create from `main` (or `develop` if implemented)
   ```bash
   git checkout -b feature/branch-name main
   ```

2. **Development**:
   - Make focused, incremental commits
   - Keep changes scoped to the specific feature/issue
   - Regularly pull from main to stay updated
   ```bash
   git pull origin main
   ```

3. **Pull Request**:
   - Create PR when feature is complete
   - Reference related issue(s) in PR description
   - Ensure all checks pass
   - Request code review

4. **Merge**:
   - Squash and merge to maintain clean history
   - Delete branch after successful merge

## Hotfix Branches

For urgent production fixes, create from `main`:
```bash
git checkout -b hotfix/issue-description main
```

## Best Practices

1. **Commit Messages**:
   - Use clear, descriptive messages
   - Reference issue numbers where applicable
   - Format: `type(scope): description`
   Example: `feat(frontend): add user authentication components`

2. **Branch Hygiene**:
   - Keep branches focused and short-lived
   - Regularly clean up merged branches
   - Rebase feature branches on main when needed

3. **Code Review**:
   - All changes must go through PR review
   - Use PR templates when available
   - Address review comments promptly

4. **Documentation**:
   - Update relevant documentation within the same PR
   - Include testing instructions in PR description
   - Document breaking changes clearly

## CI/CD Integration

- All PRs must pass automated tests
- Linting and formatting checks must pass
- Coverage requirements must be met 