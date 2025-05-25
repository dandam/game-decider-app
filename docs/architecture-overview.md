# 🧱 Game Night Concierge – Software Architecture Overview

## 📐 TL;DR

A containerized full-stack web application using **FastAPI (Python)** + **React (JavaScript)**, with a **PostgreSQL database**, tested thoroughly via **pytest** and **React Testing Library**, and deployed across `dev`, `test`, and `prod` environments using **Docker**, **GitHub Actions**, and **Cloudways**.

## 🧰 Design Principles

* 🚧 Modular
* 🧪 Testable
* 🔐 Secure
* 🧩 Extensible
* 🧘🏽‍♂️ Simple

---

## 🧱 Architecture Diagram (Layered Overview)

```
          ┌──────────────────────────────┐
          │         Discord Bot         │◄── (optional later integration)
          └──────────────────────────────┘
                        ▲
                        │
     ┌─────────────────────────────┐
     │    API Layer (FastAPI)      │
     └─────────────────────────────┘
        ▲          ▲           ▲
        │          │           │
   ┌────────┐  ┌────────┐  ┌─────────────┐
   │ Auth   │  │ Game   │  │ Player      │
   │ Module │  │ Logic  │  │ Profiles    │
   └────────┘  └────────┘  └─────────────┘
        ▲           ▲            ▲
        │           │            │
   ┌────────────────────────────────────┐
   │     PostgreSQL (via SQLAlchemy)    │
   └────────────────────────────────────┘
                        ▲
                        │
              ┌──────────────────┐
              │ React Frontend   │
              └──────────────────┘
                        ▲
                        │
              ┌──────────────────┐
              │ Docker Compose   │
              └──────────────────┘
                        ▲
                        │
              ┌──────────────────┐
              │ GitHub Actions   │
              └──────────────────┘
                        ▲
                        │
              ┌──────────────────┐
              │   Cloudways      │
              └──────────────────┘
```

---

## 🛠 Tech Stack

| Layer            | Tech                            | Notes                              |
| ---------------- | ------------------------------- | ---------------------------------- |
| Frontend         | React + Tailwind CSS            | Theming support (light/dark/modes) |
| Backend API      | FastAPI                         | Async-ready, modular, type-safe    |
| Database         | PostgreSQL                      | Rich relational features           |
| ORM              | SQLAlchemy + Alembic            | Migrations + clean data modeling   |
| Testing          | pytest, React Testing Library   | Test coverage across layers        |
| Containerization | Docker + Docker Compose         | Isolated dev/test/prod             |
| CI/CD            | GitHub Actions                  | Lint/test/build/deploy pipelines   |
| Hosting          | Cloudways                       | Use custom Docker container        |
| Auth (later)     | OAuth2 via Discord (Authlib)    | Offloads password management       |
| Future ML        | Lightweight service via FastAPI | Pluggable logic inference layer    |

---

## 📦 Modular Components

| Module              | Description                                         |
| ------------------- | --------------------------------------------------- |
| **Player Profile**  | Stores name, avatar, ELO, preferences, availability |
| **Game Library**    | List of games with metadata, tags, player range     |
| **Game Matcher**    | Rule-based engine (later: plug-in scoring AI)       |
| **Session Planner** | Optional game night calendar, attendance            |
| **Outcome Tracker** | Manual entry + eventual automated ingestion         |
| **Auth Gateway**    | OAuth2 with Discord, later integrated               |
| **Discord Bot**     | External module, uses API endpoints securely        |
| **Theming Engine**  | ASCII / pixel art themes selectable by user         |

---

## 🔬 Testing Approach

| Layer       | Tools              | Coverage Goals          |
| ----------- | ------------------ | ----------------------- |
| Frontend    | Jest, RTL, Cypress | UI + integration        |
| Backend     | pytest, httpx      | Unit + endpoint tests   |
| DB/Schema   | pytest + test db   | Constraints, migrations |
| CI pipeline | GitHub Actions     | Lint, test, deploy      |

---

## 🗃️ Dev Environments

| Env      | Features                          |
| -------- | --------------------------------- |
| **dev**  | Hot reload, local DB, seeded data |
| **test** | Headless tests, mocked services   |
| **prod** | Secure, auth required, backups    |

---

## 🔐 Security Milestone (pre-prod)

* 🔑 OAuth2 with Discord (Authlib or similar)
* ⚔️ CSRF protection, HTTPS, secure cookies
* 🕵🏽‍♂️ Rate limiting, IP logging for abuse
* 🧪 Auth-related test coverage
* 🔒 Secrets management via `.env` + Docker

---

## 📅 Development Strategy

* **Sprints = 2 weeks**, tracked in GitHub Projects
* **MVP = 1 month**, no auth/login, dev env only
* Feature-first development, each feature is modular and testable
* Use "Spikes" for unknowns (e.g., BGA API, Discord Bot framework)

