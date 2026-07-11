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
- Multi-rule character backend for COC7 and DND5E
- Public `characters` table plus rule-specific `coc7_character_sheets` and `dnd5e_character_sheets`

Dice, modules, PDF parsing, AI calls, rules, and forum features will be implemented in later MVP phases.

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

## Character API

Supported rules:

```bash
curl http://127.0.0.1:8000/characters/rules
```

Create and manage characters with a bearer token:

```text
GET    /characters/coc7/skill-catalog
GET    /characters/coc7/occupations
GET    /characters/coc7/occupations/{occupation_id}
POST   /characters/coc7
GET    /characters/coc7/{id}/skills
PUT    /characters/coc7/{id}/skills
POST   /characters/dnd5e
GET    /characters
GET    /characters/{id}
PUT    /characters/coc7/{id}
PUT    /characters/dnd5e/{id}
DELETE /characters/{id}
```

The COC7 sheet stores rule-specific sections such as investigator identity, manually entered characteristics, HP/MP/SAN values, occupation and interest skill point totals, credit rating and assets, background entries, wounds or insanity status, weapons, equipment, and fellow investigators. COC7 skills use normalized catalog, specialization, and character-skill tables. A linked `occupation_id` preserves the existing occupation-name snapshot and makes occupation skill points backend-calculated; old unlinked sheets remain compatible. The existing `skills_json` field remains temporarily for compatibility with older clients. Attribute generation is handled by the frontend.

Validation flow:

1. Register a user.
2. Log in and get `access_token`.
3. Call `GET /characters/rules`.
4. Call `GET /characters/coc7/occupations` and select an occupation ID.
5. Use `POST /characters/coc7` to create a COC7 sheet.
6. Use `POST /characters/dnd5e` to create a DND5E sheet.
7. Use `GET /characters` and `GET /characters/{id}` to verify list and detail responses.
8. Use the matching rule-specific `PUT` endpoint to update a character.
9. Use `DELETE /characters/{id}` to delete a character.

Run tests:

```bash
uv run pytest
```

## Import COC7 Occupations

After applying migrations, import a local occupation JSON file with:

```bash
uv run python -m app.services.coc7_occupation_service /path/to/调查员职业设置.json
```

The importer validates and structures skill-point formulas and credit ranges, then creates or updates occupations by their unique name. It does not delete occupations that are absent from the source file. Keep source material outside the repository unless it is safe and authorized to redistribute.
