game-night-concierge/
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       └── ci.yml            # Lint/test/build/deploy pipeline
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # API route definitions
│   │   ├── core/             # App configuration, startup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic modules
│   │   └── main.py           # FastAPI app entry point
│   ├── tests/                # pytest unit and integration tests
│   └── alembic/              # DB migrations
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.tsx
│   └── tests/                # React Testing Library + Cypress
├── docs/                     # Project planning, PRD, architecture
│   ├── README.md
│   ├── product-requirements.md
│   └── architecture-overview.md
├── .env                      # Environment variables (not committed)
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── Makefile                  # Common CLI tasks
└── README.md                 # Project root README

