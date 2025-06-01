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
├── frontend/                 # Next.js frontend
│   ├── public/               # Static files
│   ├── components/           # Reusable React components
│   ├── pages/               # Next.js page components
│   ├── styles/              # Global styles and Tailwind
│   ├── utils/               # Utility functions
│   └── tests/               # Jest + React Testing Library
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

