# 🎲 Game Night Concierge - Product Requirements Document (v0.1)

## TL;DR

Build a modular, theme-flexible web app that helps a small group of friends make better, faster, and more fun decisions about what board games to play on BoardGameArena.com. The app will track preferences, player skills, game history, and availability, with a whimsical but performant UI. Iterative development in sprints, starting with a solid MVP. Long-term goals include Discord integration, AI-driven suggestions, and robust player profiles with analytics.

---

## 📚 Table of Contents

* [Project Overview](#project-overview)
* [Development Philosophy](#development-philosophy)
* [Milestones & Sprints](#milestones--sprints)
* [Minimum Viable Product (MVP)](#minimum-viable-product-mvp)
* [Tech Stack & Architecture](#tech-stack--architecture)
* [Environments & CI/CD](#environments--cicd)
* [Testing Strategy](#testing-strategy)
* [Security Roadmap](#security-roadmap)
* [Known Spikes](#known-spikes)
* [Future Enhancements](#future-enhancements)
* [Links & Supporting Materials](#links--supporting-materials)

---

## 🎯 Project Overview

**Codename:** *Game Night Concierge* (working title, subject to whimsy)

This is a hobby-scale but technically rigorous project to build a web application that supports and enhances online board game nights for a consistent group of four friends. It will help:

* Track which games everyone knows, likes, and is willing to play.
* Consider number of players and game preferences to suggest the best-fit games.
* Track outcomes and build a shared game history.
* Eventually integrate with Discord and auto-track BoardGameArena stats.

---

## 🧱 Development Philosophy

* **Build small, ship often.** Work in 2-week sprints.
* **Modular code** enables easy feature growth later.
* **Tech choices** prioritize community support and sustainability.
* **Security and test coverage** are essential milestones, not nice-to-haves.
* **Thematic whimsy** is encouraged but not at the expense of usability.
* **Player-first mindset.** App should *feel* like a game night tool, not a spreadsheet.

---

## 🗖 Milestones & Sprints

| Sprint | Milestone               | Description                                                                 |
| ------ | ----------------------- | --------------------------------------------------------------------------- |
| 1      | Project Scaffold        | Dockerized project setup, dev/test/prod env, GitHub Actions, basic UI shell |
| 2      | MVP Core                | Player profiles, known game list, basic filtering engine, static data       |
| 3      | BGA Data Import         | Manual + auto import of 30 days of game data, BGA data spike                |
| 4      | Game Night Matching     | Core matching logic based on players present and preferences                |
| 5      | Manual Entry & Wishlist | Add/edit known games and personal wishlists                                 |
| 6      | Theming + MVP Polish    | Light/dark mode switch, prepare for alpha release in dev env                |
| 7      | Testing & Docs          | Unit/integration/functional tests, internal maintenance guide               |
| 8      | Auth & Security Prep    | Add Discord OAuth, secure routes, pen-test checklist                        |
| 9      | Beta Launch             | Deploy to prod, gather internal feedback                                    |
| 10+    | Beyond Beta             | Discord bot, full history analytics, voting system, ML rec engine           |

---

## 🧪 Minimum Viable Product (MVP)

**MVP Goals (end of Sprint 6):**

* ✅ Game/player matching logic
* ✅ Editable player profiles
* ✅ Game list with player compatibility and match filters
* ✅ Light/dark mode UI
* ✅ Manual data entry (players, known games, wishlists)
* ✅ 30-day BGA data load (via stub or spike)
* ✅ Dockerized local dev env
* ✅ Clean documentation for project setup and maintenance

---

## 🛠 Tech Stack & Architecture

| Area                 | Tool/Tech                                   |
| -------------------- | ------------------------------------------- |
| Language             | JavaScript + Python (as needed)             |
| Frontend             | React or lightweight JS framework           |
| Backend              | FastAPI (Python) or Express (Node.js)       |
| Database             | PostgreSQL or SQLite (start small)          |
| Auth (future)        | Discord OAuth via Auth0 or direct API       |
| Discord Bot (future) | discord.py or discord.js                    |
| Hosting              | Cloudways (production)                      |
| DevOps               | Docker, GitHub, GitHub Actions              |
| Testing              | Pytest/Jest, Selenium or Playwright for E2E |

---

## 🌐 Environments & CI/CD

| Env  | Description                                                    |
| ---- | -------------------------------------------------------------- |
| Dev  | Local dev via Docker                                           |
| Test | Deploy-on-merge with seeded test data                          |
| Prod | Password-protected initially, full release post-auth milestone |

GitHub Actions will run:

* Lint + unit tests on PR
* Integration tests on test deploy
* Full build + deploy on prod push

---

## ✅ Testing Strategy

* **Unit Tests**: Core logic (e.g., filtering, match engine)
* **Integration Tests**: Player/game data interactions
* **Functional Tests**: User flows via frontend automation
* **Mocks/Stubs**: For BGA APIs, Discord bots during dev
* **Test Coverage Threshold**: 80% minimum prior to beta

---

## 🔒 Security Roadmap

* No auth in MVP (dev only)
* Security milestone prior to prod includes:

  * Discord OAuth integration
  * Session management and secure routing
  * HTTPS certs and deployment validation
  * Penetration testing checklist
  * Basic RBAC (player vs admin)
* Review use of all 3rd-party libraries

---

## 🥪 Known Spikes

* 🧠 Investigate BoardGameArena’s API/data access rules
* 🤖 Review Discord bot setup and permissions model
* 🎭 Evaluate best OAuth approach (Discord-only vs hybrid)
* 🛠 Determine theming strategy (CSS vars vs CSS-in-JS)
* 📊 Analytics feasibility (e.g., skill vs preference scoring)

---

## ✨ Future Enhancements

* Discord bot with game alerts, snarky recaps, emoji polls
* Player voting system for new games or features
* ML-based game recommender based on past success/enjoyment
* Full BGA sync (ELO, badges, win rates)
* Advanced analytics dashboard ("Who wins bluffing games?")
* Offline mode or in-person session support
* Real-time planning calendar for game nights
* Player feedback + feature voting dashboard
* Cross-night analytics: "Best game for 3 players & beer"

---

## 🔗 Links & Supporting Materials

* [Design Concepts](#) *(placeholder)*
* [Code Repo (private)](#) *(placeholder)*
* [Architecture Diagram](#) *(placeholder)*
* [Sprint Backlog Tracker](#) *(placeholder - GitHub Projects?)*
* [Data Models](#) *(TBD)*

---

## 𞷹 Notes & Updates

All milestone progress and pivots will be documented inline here as the project evolves. This PRD is a living document and versioned along with the project itself.

---

**📝 Version**: 0.1
**Maintainer**: You
**Generated with help from**: ChatGPT + your vision

