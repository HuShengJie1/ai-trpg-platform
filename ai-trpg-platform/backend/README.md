# Backend

FastAPI backend for AI TRPG Platform.

## Setup

Current early MVP development can use a locally installed PostgreSQL server directly. Docker is not required for local development right now.

Create the development database in local PostgreSQL, then copy the root `.env.example` to `.env` and adjust credentials if needed:

```bash
cd ..
cp .env.example .env
```

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Docker remains available as an optional future path for shared environments, deployment, pgvector validation, or multi-developer collaboration. Keep `docker-compose.yml` in the repository, but do not require Docker during early MVP development.

## Current Scope

This backend currently contains only project scaffolding:

- FastAPI app initialization
- `GET /health` health check
- API router placeholders
- Configuration, database, and service placeholders

Business logic, authentication, database models, AI calls, and PDF parsing will be implemented in later MVP phases.
