from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, campaigns, characters, dice, forum, modules, rules

app = FastAPI(
    title="AI TRPG Platform API",
    description="Backend API for the AI TRPG Platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(characters.router, prefix="/characters", tags=["Characters"])
app.include_router(dice.router, prefix="/dice", tags=["Dice"])
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
app.include_router(rules.router, prefix="/rules", tags=["Rules"])
app.include_router(forum.router, prefix="/forum", tags=["Forum"])
