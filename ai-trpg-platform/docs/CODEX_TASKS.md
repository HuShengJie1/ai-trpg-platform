# Codex Tasks

This file maps future development work into focused Codex-friendly tasks.

## Recommended Order

1. Backend project hygiene: dependency pinning, Alembic initialization, test setup.
2. Auth module: user model, schemas, password hashing, JWT, auth routes.
3. Character module: model, schemas, CRUD routes, ownership checks.
4. Dice module: dice expression parser, roll detail format, history persistence.
5. Module management: module and module_file models, upload storage.
6. PDF parsing: PyMuPDF text extraction and module_chunk persistence.
7. RAG foundation: pgvector migration, embedding placeholder, search service.
8. Campaign loop: campaign models, messages, act endpoint, AI service integration.
9. Rules module: rule_entry model, CRUD, search, AI ask endpoint.
10. Forum module: categories, posts, replies, search and tags.
11. Frontend integration: page routes, forms, API client, chat interface.

## Guardrails

- Keep each task small and module-scoped.
- Add tests when implementing real business behavior.
- Do not commit copyrighted module or rulebook content.
- Keep AI provider calls behind `backend/app/services/ai_service.py`.
- Keep PDF extraction behind `backend/app/services/pdf_parser.py`.
- Keep retrieval logic behind `backend/app/services/rag_service.py`.
