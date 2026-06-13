from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Dnd5eCharacterSheet(Base):
    __tablename__ = "dnd5e_character_sheets"

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    race: Mapped[str | None] = mapped_column(String(255), nullable=True)
    class_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subclass: Mapped[str | None] = mapped_column(String(255), nullable=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    background: Mapped[str | None] = mapped_column(Text, nullable=True)
    alignment: Mapped[str | None] = mapped_column(String(100), nullable=True)
    player_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    experience_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    strength: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    dexterity: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    constitution: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    intelligence: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    wisdom: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    charisma: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    armor_class: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    initiative: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    speed: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    max_hp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_hp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    temporary_hp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hit_dice: Mapped[str | None] = mapped_column(String(50), nullable=True)
    proficiencies_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    skills_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    equipment_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    spellcasting_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    features_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
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
