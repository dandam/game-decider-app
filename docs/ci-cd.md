# CI/CD Documentation

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) setup for the Game Decider App.

## Overview

Our CI/CD pipeline uses GitHub Actions for automation and Codecov for code coverage reporting. The pipeline is split into frontend and backend workflows, each with its own specific checks and requirements.

## GitHub Actions Workflows

### Frontend CI (`frontend.yml`)

**Triggers:**
- Push to `main` branch (frontend files only)
- Pull requests to `main` branch (frontend files only)

**Steps:**
1. Set up Node.js environment (v18.x)
2. Install dependencies (`npm ci`)
3. Check code formatting (Prettier)
4. Run ESLint
5. Run tests with coverage
6. Upload coverage to Codecov

### Backend CI (`backend.yml`)

**Triggers:**
- Push to `main` branch (backend files only)
- Pull requests to `main` branch (backend files only)

**Steps:**
1. Set up Python environment (v3.9)
2. Start PostgreSQL service
3. Install dependencies
4. Check formatting (black)
5. Run flake8
6. Check import sorting (isort)
7. Run tests with coverage
8. Upload coverage to Codecov

## Code Coverage with Codecov

### Coverage Requirements

Both frontend and backend maintain strict coverage requirements:
- Minimum 80% code coverage for:
  - Branches
  - Functions
  - Lines
  - Statements

### Monitoring Coverage

1. **GitHub Pull Requests:**
   - Codecov bot comments on PRs with:
     - Coverage changes
     - Coverage diffs
     - File-by-file breakdown
   - Status checks show coverage requirements pass/fail

2. **Codecov Dashboard:**
   - Main dashboard: https://codecov.io/gh/[your-username]/game-decider-app
   - Features:
     - Coverage trends over time
     - Component-level coverage
     - Branch coverage comparison
     - Uncovered lines highlighting
     - Pull request impact analysis

3. **Coverage Reports:**
   - Frontend: `frontend/coverage/lcov-report/index.html` (after running tests)
   - Backend: Generated after running `pytest --cov=app`

### Codecov Configuration

The `codecov.yml` file in the root directory configures:
- Coverage status checks
- PR comment behavior
- Coverage thresholds
- Component flags

## Best Practices

1. **Writing Tests:**
   - Write tests alongside new code
   - Focus on critical paths and edge cases
   - Use meaningful test descriptions
   - Follow testing guidelines in respective README files

2. **Pull Requests:**
   - Check coverage reports before requesting review
   - Address any coverage decreases
   - Review Codecov PR comments
   - Fix failing status checks

3. **Monitoring:**
   - Regularly review coverage trends
   - Address coverage gaps
   - Monitor test quality metrics
   - Review component-level coverage

## Useful Commands

### Frontend

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Check formatting
npm run format:check

# Run linter
npm run lint
```

### Backend

```bash
# Run tests with coverage
pytest --cov=app

# Run specific tests
pytest tests/api/test_health.py

# Format code
black .

# Check imports
isort . --check

# Run all checks
python -m scripts.check
```

## Troubleshooting

### Common Issues

1. **Failed Coverage Checks:**
   - Review Codecov PR comments for specific files
   - Check uncovered lines in local coverage reports
   - Add missing test cases
   - Verify test assertions are meaningful

2. **Failed Formatting Checks:**
   - Run formatters locally before pushing
   - Configure editor to format on save
   - Review `.prettierrc.js` and `pyproject.toml` settings

3. **Failed Linting:**
   - Address ESLint/Flake8 warnings locally
   - Review configuration in `.eslintrc.js` and `.flake8`
   - Use IDE extensions for real-time linting

### Getting Help

1. **Documentation:**
   - [Codecov Documentation](https://docs.codecov.com/)
   - [GitHub Actions Documentation](https://docs.github.com/en/actions)
   - Project-specific docs in `docs/` directory

2. **Support:**
   - Create issues for CI/CD problems
   - Review workflow run logs
   - Check Codecov status page

## Future Improvements

1. **Automation:**
   - Automated dependency updates
   - Automated release notes
   - Deployment automation

2. **Monitoring:**
   - Test timing metrics
   - Coverage trend alerts
   - Performance monitoring

3. **Quality:**
   - Integration test coverage
   - E2E test coverage
   - Security scanning
   - Bundle size monitoring 