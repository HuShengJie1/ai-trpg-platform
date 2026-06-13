# Frontend

Next.js frontend for AI TRPG Platform.

## Setup

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend calls the backend at:

```text
http://127.0.0.1:8000
```

To override it, create `frontend/.env.local` locally:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Current Scope

This frontend currently contains the MVP app shell, Auth entry points, and
multi-rule character sheet pages:

- Next.js App Router structure
- TypeScript configuration
- Tailwind CSS setup
- A simple home page with future module entry points
- Auth API helpers for register, login, current user, and logout
- Character API helpers for rules, list, detail, create, update, and delete
- Register page: `http://localhost:3000/register`
- Login page: `http://localhost:3000/login`
- My account page: `http://localhost:3000/me`
- Character list page: `http://localhost:3000/characters`
- Character rule picker: `http://localhost:3000/characters/new`
- COC7 character form: `http://localhost:3000/characters/new/coc7`
- DND5E character form: `http://localhost:3000/characters/new/dnd5e`

The Auth token is stored in `localStorage` for the MVP stage. Do not commit
`frontend/.env.local`.

## Character Flow Validation

```text
1. Log in.
2. Open /characters.
3. Click create character.
4. Choose COC7 and create a COC7 character.
5. Open the COC7 detail page and edit the character.
6. Return to create character.
7. Choose DND5E and create a DND5E character.
8. Open the DND5E detail page and edit the character.
9. Delete a character from the list.
```
