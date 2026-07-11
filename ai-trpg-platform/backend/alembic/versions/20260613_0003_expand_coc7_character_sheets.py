"""expand coc7 character sheets

Revision ID: 20260613_0003
Revises: 20260613_0002
Create Date: 2026-06-13 00:00:00.000000
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260613_0003"
down_revision: str | Sequence[str] | None = "20260613_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


JSON_OBJECT_DEFAULT = sa.text("'{}'::json")


def upgrade() -> None:
    op.add_column("coc7_character_sheets", sa.Column("player_name", sa.String(length=255), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("portrait_url", sa.String(length=512), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("occupation_details", sa.Text(), nullable=True))
    op.add_column(
        "coc7_character_sheets",
        sa.Column("occupation_skill_points", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("personal_interest_points", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("credit_rating", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("max_hp", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("max_mp", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("starting_san", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("max_san", sa.Integer(), server_default="99", nullable=False),
    )
    op.add_column("coc7_character_sheets", sa.Column("spending_level", sa.String(length=255), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("cash", sa.String(length=255), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("assets", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("personal_description", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("ideology_beliefs", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("significant_people", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("meaningful_locations", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("treasured_possessions", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("traits", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("key_connection", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("injuries_scars", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("phobias_manias", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("arcane_tomes_spells_artifacts", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("encounters_with_strange_entities", sa.Text(), nullable=True))
    op.add_column("coc7_character_sheets", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column(
        "coc7_character_sheets",
        sa.Column("major_wound", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("unconscious", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("dying", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("temporary_insanity", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("indefinite_insanity", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("occupation_skills_json", sa.JSON(), server_default=JSON_OBJECT_DEFAULT, nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("weapons_json", sa.JSON(), server_default=JSON_OBJECT_DEFAULT, nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("fellow_investigators_json", sa.JSON(), server_default=JSON_OBJECT_DEFAULT, nullable=False),
    )
    op.add_column(
        "coc7_character_sheets",
        sa.Column("development_json", sa.JSON(), server_default=JSON_OBJECT_DEFAULT, nullable=False),
    )
    op.create_check_constraint(
        "ck_coc7_character_sheets_credit_rating_range",
        "coc7_character_sheets",
        "credit_rating >= 0 AND credit_rating <= 100",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_coc7_character_sheets_credit_rating_range",
        "coc7_character_sheets",
        type_="check",
    )
    op.drop_column("coc7_character_sheets", "development_json")
    op.drop_column("coc7_character_sheets", "fellow_investigators_json")
    op.drop_column("coc7_character_sheets", "weapons_json")
    op.drop_column("coc7_character_sheets", "occupation_skills_json")
    op.drop_column("coc7_character_sheets", "indefinite_insanity")
    op.drop_column("coc7_character_sheets", "temporary_insanity")
    op.drop_column("coc7_character_sheets", "dying")
    op.drop_column("coc7_character_sheets", "unconscious")
    op.drop_column("coc7_character_sheets", "major_wound")
    op.drop_column("coc7_character_sheets", "notes")
    op.drop_column("coc7_character_sheets", "encounters_with_strange_entities")
    op.drop_column("coc7_character_sheets", "arcane_tomes_spells_artifacts")
    op.drop_column("coc7_character_sheets", "phobias_manias")
    op.drop_column("coc7_character_sheets", "injuries_scars")
    op.drop_column("coc7_character_sheets", "key_connection")
    op.drop_column("coc7_character_sheets", "traits")
    op.drop_column("coc7_character_sheets", "treasured_possessions")
    op.drop_column("coc7_character_sheets", "meaningful_locations")
    op.drop_column("coc7_character_sheets", "significant_people")
    op.drop_column("coc7_character_sheets", "ideology_beliefs")
    op.drop_column("coc7_character_sheets", "personal_description")
    op.drop_column("coc7_character_sheets", "assets")
    op.drop_column("coc7_character_sheets", "cash")
    op.drop_column("coc7_character_sheets", "spending_level")
    op.drop_column("coc7_character_sheets", "max_san")
    op.drop_column("coc7_character_sheets", "starting_san")
    op.drop_column("coc7_character_sheets", "max_mp")
    op.drop_column("coc7_character_sheets", "max_hp")
    op.drop_column("coc7_character_sheets", "credit_rating")
    op.drop_column("coc7_character_sheets", "personal_interest_points")
    op.drop_column("coc7_character_sheets", "occupation_skill_points")
    op.drop_column("coc7_character_sheets", "occupation_details")
    op.drop_column("coc7_character_sheets", "portrait_url")
    op.drop_column("coc7_character_sheets", "player_name")
