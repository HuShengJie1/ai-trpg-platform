from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, func
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
    occupation_id: Mapped[int | None] = mapped_column(
        ForeignKey("coc7_occupations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    player_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    portrait_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    occupation_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(100), nullable=True)
    residence: Mapped[str | None] = mapped_column(String(255), nullable=True)
    birthplace: Mapped[str | None] = mapped_column(String(255), nullable=True)
    background: Mapped[str | None] = mapped_column(Text, nullable=True)
    occupation_skill_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    personal_interest_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    credit_rating: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
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
    max_hp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_mp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    san: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    starting_san: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_san: Mapped[int] = mapped_column(Integer, nullable=False, default=99)
    build: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    damage_bonus: Mapped[str | None] = mapped_column(String(50), nullable=True)
    move: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    spending_level: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    assets: Mapped[str | None] = mapped_column(Text, nullable=True)
    personal_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ideology_beliefs: Mapped[str | None] = mapped_column(Text, nullable=True)
    significant_people: Mapped[str | None] = mapped_column(Text, nullable=True)
    meaningful_locations: Mapped[str | None] = mapped_column(Text, nullable=True)
    treasured_possessions: Mapped[str | None] = mapped_column(Text, nullable=True)
    traits: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_connection: Mapped[str | None] = mapped_column(Text, nullable=True)
    injuries_scars: Mapped[str | None] = mapped_column(Text, nullable=True)
    phobias_manias: Mapped[str | None] = mapped_column(Text, nullable=True)
    arcane_tomes_spells_artifacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    encounters_with_strange_entities: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    major_wound: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    unconscious: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    dying: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    temporary_insanity: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    indefinite_insanity: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    skills_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    occupation_skills_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    equipment_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    weapons_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    backstory_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    status_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    fellow_investigators_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    development_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
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
