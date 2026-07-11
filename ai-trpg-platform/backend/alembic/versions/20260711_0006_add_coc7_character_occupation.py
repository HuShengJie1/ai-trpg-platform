"""add occupation relation to coc7 character sheets

Revision ID: 20260711_0006
Revises: 20260711_0005
Create Date: 2026-07-11 00:30:00.000000
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260711_0006"
down_revision: str | Sequence[str] | None = "20260711_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "coc7_character_sheets",
        sa.Column("occupation_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_coc7_character_sheets_occupation_id_coc7_occupations",
        "coc7_character_sheets",
        "coc7_occupations",
        ["occupation_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_coc7_character_sheets_occupation_id",
        "coc7_character_sheets",
        ["occupation_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_coc7_character_sheets_occupation_id",
        table_name="coc7_character_sheets",
    )
    op.drop_constraint(
        "fk_coc7_character_sheets_occupation_id_coc7_occupations",
        "coc7_character_sheets",
        type_="foreignkey",
    )
    op.drop_column("coc7_character_sheets", "occupation_id")
