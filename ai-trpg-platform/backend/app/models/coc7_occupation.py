from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Coc7Occupation(Base):
    __tablename__ = "coc7_occupations"
    __table_args__ = (
        CheckConstraint(
            "credit_min >= 0 AND credit_min <= 99",
            name="ck_coc7_occupations_credit_min_range",
        ),
        CheckConstraint(
            "credit_max >= 0 AND credit_max <= 99",
            name="ck_coc7_occupations_credit_max_range",
        ),
        CheckConstraint(
            "credit_min <= credit_max",
            name="ck_coc7_occupations_credit_order",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    skill_points_formula: Mapped[str] = mapped_column(String(255), nullable=False)
    skill_points_formula_json: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    credit_min: Mapped[int] = mapped_column(Integer, nullable=False)
    credit_max: Mapped[int] = mapped_column(Integer, nullable=False)
    credit_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    occupation_skills_json: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
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
