from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Coc7CharacterSheet(Base):
    __tablename__ = "coc7_character_sheets"

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    occupation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(100), nullable=True)
    residence: Mapped[str | None] = mapped_column(String(255), nullable=True)
    birthplace: Mapped[str | None] = mapped_column(String(255), nullable=True)
    background: Mapped[str | None] = mapped_column(Text, nullable=True)
    str_score: Mapped[int] = mapped_column("str", Integer, nullable=False, default=0)
    con: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    siz: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    dex: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    app: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    int_score: Mapped[int] = mapped_column("int", Integer, nullable=False, default=0)
    pow: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    edu: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    luck: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    san: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    build: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    damage_bonus: Mapped[str | None] = mapped_column(String(50), nullable=True)
    move: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skills_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    equipment_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    backstory_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    status_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
