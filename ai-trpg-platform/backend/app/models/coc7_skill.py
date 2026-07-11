from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Coc7SkillDefinition(Base):
    __tablename__ = "coc7_skill_definitions"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    base_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    base_formula: Mapped[str | None] = mapped_column(String(50), nullable=True)
    allows_specialization: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allows_custom_specialization: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    is_custom: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
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


class Coc7SkillSpecialization(Base):
    __tablename__ = "coc7_skill_specializations"
    __table_args__ = (
        UniqueConstraint(
            "skill_definition_id",
            "key",
            name="uq_coc7_skill_specializations_definition_key",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_definition_id: Mapped[int] = mapped_column(
        ForeignKey("coc7_skill_definitions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    base_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Coc7CharacterSkill(Base):
    __tablename__ = "coc7_character_skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    character_sheet_id: Mapped[int] = mapped_column(
        ForeignKey("coc7_character_sheets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_definition_id: Mapped[int] = mapped_column(
        ForeignKey("coc7_skill_definitions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    skill_specialization_id: Mapped[int | None] = mapped_column(
        ForeignKey("coc7_skill_specializations.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    custom_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    custom_specialization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    base_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    occupation_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    interest_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    growth_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_occupation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    improvement_checked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
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
