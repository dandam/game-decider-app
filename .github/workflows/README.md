# GitHub Actions Workflows

This directory contains our CI/CD workflows for automated testing and deployment.

## Frontend CI (`frontend.yml`)

Triggers:
- On push to `main` branch (frontend files only)
- On pull requests to `main` branch (frontend files only)

Steps:
1. Set up Node.js environment
2. Install dependencies
3. Check code formatting (Prettier)
4. Run ESLint
5. Run tests with coverage
6. Upload coverage reports to Codecov

Requirements:
- Node.js 18.x
- `CODECOV_TOKEN` secret for coverage reporting

## Backend CI (`backend.yml`)

Triggers:
- On push to `main` branch (backend files only)
- On pull requests to `main` branch (backend files only)

Steps:
1. Set up Python environment
2. Start PostgreSQL service
3. Install dependencies
4. Check code formatting (black)
5. Run flake8
6. Check import sorting (isort)
7. Run tests with coverage
8. Upload coverage reports to Codecov

Requirements:
- Python 3.9
- PostgreSQL 13
- `CODECOV_TOKEN` secret for coverage reporting

## Environment Variables

### Frontend
No specific environment variables required for CI.

### Backend
- `DATABASE_URL`: Set automatically for testing
- `TESTING`: Set to "1" during test runs

## Coverage Reports

Both workflows upload coverage reports to Codecov with:
- Separate flags for frontend and backend
- XML coverage reports
- Detailed coverage information per component

## Best Practices
1. Keep workflows focused and minimal
2. Use caching for faster builds
3. Run tests in parallel where possible
4. Use specific version tags for actions
5. Monitor workflow execution times
6. Keep secrets in GitHub repository settings 