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

This frontend currently contains the MVP app shell and Auth entry points:

- Next.js App Router structure
- TypeScript configuration
- Tailwind CSS setup
- A simple home page with future module entry points
- Auth API helpers for register, login, current user, and logout
- Register page: `http://localhost:3000/register`
- Login page: `http://localhost:3000/login`
- My account page: `http://localhost:3000/me`

The Auth token is stored in `localStorage` for the MVP stage. Do not commit
`frontend/.env.local`.
