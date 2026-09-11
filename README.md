# 🚢 Sagar Setu

**Intelligent Freight Forecasting & Vessel Chartering Optimization Platform**

> Smart India Hackathon 2026 — Problem Statement SIH26006
> Ministry of Steel, Government of India | Transportation & Logistics

---

## Overview

Sagar Setu is a decision-support platform that:
- **Forecasts freight rates** for overseas-to-East-Coast-India bulk shipping routes
- **Recommends optimal vessel type & charter strategy** for cargo orders
- **Generates optimized procurement + shipping schedules** minimizing total landed cost
- **Provides scenario simulation** for what-if analysis
- **Delivers a unified dashboard** for Ministry/PSU planners

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + Recharts |
| Backend | FastAPI (Python) |
| ML/Forecasting | SARIMA + Prophet + XGBoost (ensemble) |
| Optimization | PuLP (CBC solver) |
| Database | PostgreSQL 15 + TimescaleDB |
| Cache | Redis |
| Containerization | Docker + docker-compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for frontend dev outside Docker)
- Python 3.11+ (for backend dev outside Docker)

### One-Command Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd sagar-setu

# 2. Copy environment config
cp .env.example .env

# 3. Start all services
docker-compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Project Structure

```
sagar-setu/
├── frontend/                # React + TypeScript SPA
├── backend/
│   ├── api/                 # FastAPI gateway (auth, CRUD, routing)
│   ├── forecasting/         # ML forecasting service
│   ├── optimization/        # LP/MILP optimization engine
│   └── etl/                 # Data ingestion + synthetic data generator
├── db/
│   ├── migrations/          # SQL migration files
│   └── seed/                # Synthetic seed data scripts
├── docs/                    # PRD, TRD, schema, design docs
├── docker-compose.yml       # One-command local setup
└── .env.example             # Environment config template
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@sagarsetu.gov.in | admin123 |
| Chartering Officer | charter@sail.gov.in | charter123 |
| Procurement Planner | planner@sail.gov.in | planner123 |
| Viewer (Ministry) | viewer@steel.gov.in | viewer123 |

## Documentation

See `docs/` folder for:
- Product Requirements (PRD)
- Technical Requirements (TRD)
- Application Flow
- UI/UX Design System
- Database Schema
- Implementation Plan

## License

Built for Smart India Hackathon 2026 — SIH26006
