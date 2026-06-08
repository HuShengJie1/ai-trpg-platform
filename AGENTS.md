# AGENTS.md

This document defines the working rules for Codex and other AI coding agents in this repository.

Project name: **AI TRPG Platform / AI 跑团平台**

This file is the main instruction document for AI coding agents.
Before making changes, Codex must read this file and follow its rules.

The goal is to keep development consistent, avoid unnecessary rewrites, and ensure each task is completed in small, reviewable steps.

---

## 1. Project Overview

This project is an AI-powered tabletop role-playing game platform.

The final system should support:

1. User accounts and authentication
2. Character sheet creation and management
3. Dice rolling and rule-based checks
4. Module management
5. PDF module upload and parsing
6. Module knowledge base and RAG retrieval
7. AI game master / AI keeper campaign flow
8. Campaign save data and chat history
9. Rule search and AI rule Q&A
10. Player forum and discussion system

The first development goal is **not** to build the entire product at once.

The first goal is to build a clean, maintainable project structure and then complete the MVP step by step.

---

## 2. Main Product Flow

The core product flow is:

```text
Upload PDF module
→ Parse PDF text
→ Split text into module chunks
→ Store module knowledge
→ Create character
→ Create campaign
→ Player sends an action
→ Retrieve relevant module chunks
→ AI game master generates response
→ Dice check if needed
→ Save campaign messages and campaign state
```

All backend and frontend work should support this flow.

---

## 3. Repository Structure

Expected repository layout:

```text
ai-trpg-platform/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── package.json
│   └── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── characters.py
│   │   │   ├── dice.py
│   │   │   ├── modules.py
│   │   │   ├── campaigns.py
│   │   │   ├── rules.py
│   │   │   └── forum.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── base.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── pdf_parser.py
│   │   │   ├── dice_service.py
│   │   │   ├── ai_service.py
│   │   │   └── rag_service.py
│   │   └── main.py
│   ├── alembic/
│   ├── pyproject.toml
│   ├── uv.lock
│   └── README.md
├── docs/
│   ├── SYSTEM_DESIGN.md
│   ├── DATABASE_DESIGN.md
│   ├── API_DESIGN.md
│   ├── TODO.md
│   └── CODEX_TASKS.md
├── uploads/
│   └── modules/
├── .github/
│   └── ISSUE_TEMPLATE/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── AGENTS.md
└── README.md
```

Do not reorganize this structure unless the task explicitly requires it.

---

## 4. Development Strategy

Always develop in small steps.

Do not try to implement the entire platform in one task.

Recommended milestone order:

```text
MVP-0 Project Setup
→ MVP-1 Core Backend
→ MVP-2 PDF Module Import
→ MVP-3 AI Campaign Flow
→ MVP-4 Rules and Forum
→ MVP-5 Frontend Integration
```

Recommended feature order:

```text
Project scaffold
→ Backend database foundation
→ User authentication
→ Character CRUD
→ Dice rolling
→ Module CRUD
→ PDF upload
→ PDF parsing
→ Campaign and messages
→ AI campaign action endpoint
→ Rules
→ Forum
→ Frontend integration
```

Do not start AI campaign flow before the basic data models exist.

Do not start complex frontend work before the backend API shape is stable.

---

## 5. General Codex Working Rules

When working on this repository:

1. Read this `AGENTS.md` before making changes.
2. Read relevant files in `docs/` before implementing a feature.
3. Work on only one small task at a time.
4. Do not implement unrelated features.
5. Do not rewrite the whole project.
6. Do not remove existing documentation unless explicitly asked.
7. Do not rename major folders without approval.
8. Do not add heavy dependencies without a clear reason.
9. Do not hard-code secrets, API keys, database passwords, or tokens.
10. Do not commit `.env`, `.venv`, build outputs, cache folders, or uploaded user files.
11. Prefer simple, maintainable code over complex abstractions.
12. If a task is ambiguous, choose the smallest reasonable implementation and document assumptions.
13. After finishing, list changed files and validation steps.
14. If tests or commands cannot be run, explain why.

---

## 6. Backend Technology Rules

The backend uses:

* FastAPI
* Python
* SQLAlchemy
* Pydantic
* Alembic
* PostgreSQL
* Future support for pgvector
* PyMuPDF for PDF parsing
* uv for Python environment and dependency management

Backend code layout rules:

```text
backend/app/api/        API route handlers
backend/app/core/       configuration and security helpers
backend/app/db/         database session, engine, and Base
backend/app/models/     SQLAlchemy models
backend/app/schemas/    Pydantic request/response schemas
backend/app/services/   business logic and external service wrappers
backend/app/main.py     FastAPI app entrypoint
```

API files should stay thin.

Business logic should be placed in `services/`.

Database models should be placed in `models/`.

Pydantic schemas should be placed in `schemas/`.

Do not put large business logic directly inside route handlers.

---

## 7. Python Environment Management With uv

The backend Python environment must be managed with **uv**.

Use `backend/pyproject.toml` as the main dependency definition file.

Use `backend/uv.lock` to lock dependency versions.

Do not use global `pip` to install project dependencies.

Do not manually edit `uv.lock`.

Do not commit `.venv/`.

Do not require developers to manually activate a virtual environment. Prefer `uv run`.

### Required uv workflow

From the backend directory:

```bash
cd backend
uv sync
```

Run the backend:

```bash
uv run uvicorn app.main:app --reload
```

Run tests:

```bash
uv run pytest
```

Run Alembic migrations:

```bash
uv run alembic upgrade head
```

Add a runtime dependency:

```bash
uv add package-name
```

Add a development dependency:

```bash
uv add --dev package-name
```

If a task requires adding a Python package, use `uv add`.

Do not add dependencies by manually editing `requirements.txt`.

If `requirements.txt` exists, it is only for compatibility notes and should not be treated as the primary dependency source.

---

## 8. Backend Dependency Baseline

The backend should use `pyproject.toml`.

Baseline runtime dependencies may include:

```text
fastapi
uvicorn
sqlalchemy
pydantic
alembic
psycopg
python-dotenv
python-multipart
passlib
python-jose
PyMuPDF
```

Baseline development dependencies may include:

```text
pytest
```

Only add more dependencies when the current task clearly needs them.

---

## 9. Frontend Technology Rules

The frontend uses:

* Next.js
* React
* TypeScript
* Tailwind CSS

Frontend code layout rules:

```text
frontend/app/          Next.js app routes and pages
frontend/components/   reusable UI components
frontend/lib/          helper functions and API client utilities
frontend/types/        shared TypeScript types
```

Frontend development principles:

1. Keep UI simple during MVP.
2. Build usable pages before polishing visuals.
3. Avoid complex state management unless necessary.
4. Prefer typed API helper functions.
5. Do not build full design systems during early MVP.
6. Do not hard-code backend URLs directly in many components; use a shared config or API helper.

---

## 10. Database Rules

The main database is PostgreSQL.

Future vector retrieval should use pgvector.

Use SQLAlchemy for models.

Use Alembic for migrations.

Do not create tables manually outside migrations once Alembic is configured.

Each model should have:

* `id`
* created timestamp when appropriate
* updated timestamp when appropriate
* clear foreign keys
* simple field names consistent with `docs/DATABASE_DESIGN.md`

For early MVP, JSON fields are acceptable for flexible TRPG data such as:

```text
attributes_json
skills_json
equipment_json
status_json
state_json
metadata_json
```

Do not over-normalize character sheets in the first version.

---

## 11. Expected Core Tables

The system is expected to eventually contain:

```text
user
character
dice_roll
module
module_file
module_chunk
campaign
campaign_character
campaign_message
rule_entry
forum_category
forum_post
forum_reply
```

Before implementing or changing these tables, check:

```text
docs/DATABASE_DESIGN.md
docs/API_DESIGN.md
docs/SYSTEM_DESIGN.md
```

---

## 12. API Design Rules

Follow the API design in `docs/API_DESIGN.md`.

Expected route groups:

```text
/auth
/characters
/dice
/modules
/campaigns
/rules
/forum
```

Keep response formats consistent.

Use Pydantic schemas for request and response models.

Use proper HTTP status codes.

Do not expose internal database errors directly to users.

Do not expose password hashes, API keys, or private system data.

---

## 13. AI Service Rules

AI functionality should be isolated in:

```text
backend/app/services/ai_service.py
```

Do not call AI APIs directly from route handlers.

Do not hard-code API keys.

Read AI API keys from environment variables.

For early MVP, AI service may be a placeholder.

When real AI calling is implemented, it should be wrapped in a clear function such as:

```python
generate_response(prompt: str) -> str
```

or a structured equivalent.

AI game master behavior should follow these principles:

1. Do not reveal GM-only information to players.
2. Do not spoil final truths unless discovered through play.
3. Use module content as grounding.
4. Ask for dice checks when player actions are uncertain.
5. Keep NPCs, locations, clues, and campaign state consistent.
6. Avoid large unsupported inventions that contradict the module.
7. Use concise but immersive TRPG narration.

---

## 14. RAG and Module Knowledge Rules

RAG-related logic should be isolated in:

```text
backend/app/services/rag_service.py
```

PDF parsing should be isolated in:

```text
backend/app/services/pdf_parser.py
```

Module knowledge should be stored as chunks in `module_chunk`.

Each chunk should preserve:

```text
module_id
file_id
page_number
section_title
content
content_type
visibility
embedding
created_at
```

Do not give player-facing retrieval access to GM-only content.

Chunk visibility must be considered when building player-facing or AI-facing features.

Possible visibility values:

```text
player
gm
system
```

For MVP, embedding generation may be a placeholder.

Do not implement complex vector search before the basic PDF parsing and chunk storage pipeline works.

---

## 15. PDF Module Import Rules

PDF import should support this staged approach:

```text
MVP stage:
PDF upload
→ save module_file record
→ extract text using PyMuPDF
→ split text into chunks
→ save module_chunk records
```

Later stage:

```text
OCR
→ table extraction
→ image extraction
→ automatic NPC/location/clue classification
→ embedding generation
→ vector retrieval
```

Do not implement OCR unless the task explicitly asks for it.

Do not include real copyrighted TRPG module contents in the repository.

Do not commit uploaded PDFs.

Uploaded files should stay under:

```text
uploads/modules/
```

and should generally be ignored by Git, except for placeholder `.gitkeep` files if needed.

---

## 16. Dice System Rules

Dice logic should be isolated in:

```text
backend/app/services/dice_service.py
```

The MVP dice parser should support at least:

```text
1d100
1d20+5
2d6+3
```

The dice service should return:

```text
expression
total result
individual rolls
modifier
detail_json
```

Dice rolls should later be stored in `dice_roll`.

Do not mix dice parsing logic directly into API routes.

---

## 17. Authentication and Security Rules

Authentication will use JWT.

Password storage must use hashing.

Never store plain-text passwords.

Never expose password hashes in API responses.

Security-related helpers should be placed in:

```text
backend/app/core/security.py
```

Configuration should be placed in:

```text
backend/app/core/config.py
```

Environment variables should be read from `.env` or the runtime environment.

`.env.example` may be committed.

`.env` must not be committed.

---

## 18. Forum Rules

Forum backend should eventually support:

```text
forum_category
forum_post
forum_reply
```

Core forum features:

1. Category list
2. Create post
3. List posts
4. Post detail
5. Edit post
6. Delete post
7. Reply to post
8. List replies
9. Search posts
10. Filter by tags

Only the author or an admin should edit or delete a post or reply.

Do not implement moderation, reporting, or advanced ranking unless explicitly requested.

---

## 19. Rules Knowledge Base Rules

Rules system should eventually support:

```text
rule_entry
```

Expected features:

1. Create rule entry
2. Search rules
3. View rule detail
4. AI rule Q&A
5. Related forum posts

Do not include full copyrighted rulebooks in the repository.

Use short sample entries only when needed for testing.

---

## 20. Documentation Rules

Documentation lives in:

```text
docs/
```

Important docs:

```text
docs/SYSTEM_DESIGN.md
docs/DATABASE_DESIGN.md
docs/API_DESIGN.md
docs/TODO.md
docs/CODEX_TASKS.md
```

When implementing a feature, update documentation if the implementation changes the API, database design, startup commands, or project structure.

Do not let docs become inconsistent with code.

---

## 21. GitHub Issues and Milestones

The project should use GitHub Issues for task tracking.

Expected labels:

```text
priority: high
priority: medium
priority: low
type: backend
type: frontend
type: database
type: ai
type: pdf
type: forum
type: docs
status: todo
status: in-progress
status: done
```

Expected milestones:

```text
MVP-0 Project Setup
MVP-1 Core Backend
MVP-2 PDF Module Import
MVP-3 AI Campaign Flow
MVP-4 Rules and Forum
MVP-5 Frontend Integration
```

If GitHub CLI is available, use it for issues, labels, and milestones when asked.

If GitHub CLI is not available, update `docs/TODO.md` instead.

Do not stop development only because GitHub CLI is unavailable.

---

## 22. Branch, Commit, and PR Rules

Use small commits.

Commit messages should be clear and conventional when possible.

Examples:

```text
chore: initialize project scaffold
chore: add AGENTS.md for codex workflow
chore: configure backend database foundation
feat: add character CRUD API
feat: add dice rolling service
feat: add PDF upload endpoint
docs: update API design for campaigns
fix: correct database session dependency
```

For Codex tasks:

1. Prefer one task per commit.
2. Prefer one issue per PR.
3. Do not mix unrelated backend and frontend work unless the task requires it.
4. At the end of a task, report changed files and validation commands.

---

## 23. Testing Rules

Use `pytest` for backend tests.

Run backend tests with:

```bash
cd backend
uv run pytest
```

If tests do not exist yet, provide manual validation steps.

When adding non-trivial services such as dice parsing or PDF chunking, add basic tests.

At minimum, test:

```text
dice expression parsing
auth helpers
PDF parser behavior on simple files
core API health check
```

Do not skip tests silently.

If tests cannot be run, explain the reason.

---

## 24. Local Development Commands

### Start database

From repository root:

```bash
docker compose up -d
```

### Backend setup

```bash
cd backend
uv sync
```

### Start backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

### Run backend tests

```bash
cd backend
uv run pytest
```

### Run migrations

```bash
cd backend
uv run alembic upgrade head
```

### Frontend setup

```bash
cd frontend
npm install
```

### Start frontend

```bash
cd frontend
npm run dev
```

---

## 25. Environment Variables

The root `.env.example` should include at least:

```text
DATABASE_URL=
SECRET_KEY=
OPENAI_API_KEY=
UPLOAD_DIR=
```

Never commit `.env`.

Never hard-code secrets.

Use environment variables through config helpers.

---

## 26. File and Upload Rules

Do not commit uploaded user files.

Do not commit real PDF modules.

Do not commit copyrighted content.

The upload directory is:

```text
uploads/modules/
```

Keep placeholder files only if needed to preserve the folder.

---

## 27. What Not To Do

Do not:

1. Implement the whole project in one task.
2. Rewrite the repository structure without approval.
3. Use global pip for backend dependencies.
4. Commit `.venv`.
5. Commit `.env`.
6. Hard-code API keys.
7. Add real copyrighted TRPG rules or modules.
8. Put business logic directly in API route files.
9. Build complex UI before backend APIs are stable.
10. Implement OCR before basic PDF parsing works.
11. Implement vector search before chunks are stored correctly.
12. Implement AI campaign flow before campaigns, characters, messages, and modules exist.
13. Delete existing docs without explicit instruction.
14. Modify unrelated files in a focused task.
15. Claim tests passed if they were not run.

---

## 28. Task Completion Checklist

Before finishing any task, verify:

```text
[ ] The task scope was followed.
[ ] No unrelated features were added.
[ ] No secrets were committed.
[ ] No .env or .venv was committed.
[ ] Backend dependencies use uv if changed.
[ ] Documentation was updated if needed.
[ ] Commands or tests were run if possible.
[ ] Changed files are listed in the final response.
[ ] Validation steps are provided.
[ ] Commit message is clear.
```

---

## 29. Done When

A task is done when:

1. The requested feature or scaffold is implemented.
2. The project still starts, or limitations are clearly explained.
3. Relevant docs are updated.
4. Tests or manual validation steps are provided.
5. No unrelated files were modified.
6. The final response explains:

   * what changed
   * which files changed
   * how to run or verify
   * what to do next

---

## 30. Recommended Next Tasks

After project scaffold and this `AGENTS.md` are in place, the next recommended development sequence is:

```text
1. Verify MVP-0 project scaffold
2. Configure backend database foundation with uv
3. Configure Alembic
4. Implement user model and auth schemas
5. Implement register/login/JWT
6. Implement character CRUD
7. Implement dice service and dice API
8. Implement module CRUD
9. Implement PDF upload
10. Implement PDF parsing and module chunks
11. Implement campaign and campaign messages
12. Implement AI campaign action placeholder
13. Implement rules search
14. Implement forum posts and replies
15. Integrate frontend pages
```

Always keep tasks small.
