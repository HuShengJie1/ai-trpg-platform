"""create coc7 occupations table

Revision ID: 20260711_0005
Revises: 20260625_0004
Create Date: 2026-07-11 00:00:00.000000
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260711_0005"
down_revision: str | Sequence[str] | None = "20260625_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "coc7_occupations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("skill_points_formula", sa.String(length=255), nullable=False),
        sa.Column("skill_points_formula_json", sa.JSON(), nullable=False),
        sa.Column("credit_min", sa.Integer(), nullable=False),
        sa.Column("credit_max", sa.Integer(), nullable=False),
        sa.Column("credit_note", sa.Text(), nullable=True),
        sa.Column("occupation_skills_json", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "credit_min >= 0 AND credit_min <= 99",
            name="ck_coc7_occupations_credit_min_range",
        ),
        sa.CheckConstraint(
            "credit_max >= 0 AND credit_max <= 99",
            name="ck_coc7_occupations_credit_max_range",
        ),
        sa.CheckConstraint(
            "credit_min <= credit_max",
            name="ck_coc7_occupations_credit_order",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_coc7_occupations_name"),
    )


def downgrade() -> None:
    op.drop_table("coc7_occupations")
