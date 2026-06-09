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
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Docker remains available as an optional future path for shared environments, deployment, pgvector validation, or multi-developer collaboration. Keep `docker-compose.yml` in the repository, but do not require Docker during early MVP development.

## Current Scope

This backend currently contains project scaffolding and the MVP-1 Auth backend:

- FastAPI app initialization
- `GET /health` health check
- API router placeholders
- Configuration, database, and service placeholders
- User registration with hashed passwords
- User login with JWT bearer tokens
- `GET /auth/me` current-user endpoint

Character sheets, dice, modules, PDF parsing, AI calls, rules, and forum features will be implemented in later MVP phases.

## Auth API

Register:

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
```

Login:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Current user:

```bash
curl http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

Run tests:

```bash
uv run pytest
```
