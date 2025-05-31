# 🎲 Game Night Concierge

A modern web application that helps friends make better decisions about what board games to play on BoardGameArena.com. Track preferences, skills, game history, and get intelligent recommendations for your next game night!

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.11
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Development Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:dandam/game-decider-app.git
   cd game-decider-app
   ```

2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. Start the development environment:
   ```bash
   docker compose up --build
   ```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:8000
- PostgreSQL database
- Hot reloading for both frontend and backend

## 🏗 Project Structure

```
game-decider-app/
├── frontend/          # React frontend application
├── backend/          # FastAPI backend service
├── docs/             # Project documentation
└── docker/           # Docker configuration files
```

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && python -m pytest
```

## 📚 Documentation

- [Product Requirements Document](docs/game-night-concierge-prd.md)
- [Architecture Overview](docs/architecture-overview.md)
- [API Documentation](http://localhost:8000/docs) (when backend is running)

## 🛠 Development

- Use `docker compose up --build` for local development
- Create feature branches from `main`
- Follow the [contribution guidelines](CONTRIBUTING.md)
- Ensure tests pass before submitting PRs

## 📝 License

Private repository - All rights reserved 