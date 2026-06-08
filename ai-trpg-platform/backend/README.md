# Backend

FastAPI backend for AI TRPG Platform.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Current Scope

This backend currently contains only project scaffolding:

- FastAPI app initialization
- `GET /health` health check
- API router placeholders
- Configuration, database, and service placeholders

Business logic, authentication, database models, AI calls, and PDF parsing will be implemented in later MVP phases.
