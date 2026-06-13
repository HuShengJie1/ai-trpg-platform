"""create character tables

Revision ID: 20260613_0002
Revises: 20260609_0001
Create Date: 2026-06-13 00:00:00.000000
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260613_0002"
down_revision: str | Sequence[str] | None = "20260609_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "characters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("rule_system", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_characters_rule_system"), "characters", ["rule_system"], unique=False)
    op.create_index(op.f("ix_characters_user_id"), "characters", ["user_id"], unique=False)

    op.create_table(
        "coc7_character_sheets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("occupation", sa.String(length=255), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("gender", sa.String(length=100), nullable=True),
        sa.Column("residence", sa.String(length=255), nullable=True),
        sa.Column("birthplace", sa.String(length=255), nullable=True),
        sa.Column("background", sa.Text(), nullable=True),
        sa.Column("str", sa.Integer(), nullable=False),
        sa.Column("con", sa.Integer(), nullable=False),
        sa.Column("siz", sa.Integer(), nullable=False),
        sa.Column("dex", sa.Integer(), nullable=False),
        sa.Column("app", sa.Integer(), nullable=False),
        sa.Column("int", sa.Integer(), nullable=False),
        sa.Column("pow", sa.Integer(), nullable=False),
        sa.Column("edu", sa.Integer(), nullable=False),
        sa.Column("luck", sa.Integer(), nullable=False),
        sa.Column("hp", sa.Integer(), nullable=False),
        sa.Column("mp", sa.Integer(), nullable=False),
        sa.Column("san", sa.Integer(), nullable=False),
        sa.Column("build", sa.Integer(), nullable=False),
        sa.Column("damage_bonus", sa.String(length=50), nullable=True),
        sa.Column("move", sa.Integer(), nullable=False),
        sa.Column("skills_json", sa.JSON(), nullable=False),
        sa.Column("equipment_json", sa.JSON(), nullable=False),
        sa.Column("backstory_json", sa.JSON(), nullable=False),
        sa.Column("status_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint('"str" >= 0 AND "str" <= 100', name="ck_coc7_character_sheets_str_range"),
        sa.CheckConstraint('"con" >= 0 AND "con" <= 100', name="ck_coc7_character_sheets_con_range"),
        sa.CheckConstraint('"siz" >= 0 AND "siz" <= 100', name="ck_coc7_character_sheets_siz_range"),
        sa.CheckConstraint('"dex" >= 0 AND "dex" <= 100', name="ck_coc7_character_sheets_dex_range"),
        sa.CheckConstraint('"app" >= 0 AND "app" <= 100', name="ck_coc7_character_sheets_app_range"),
        sa.CheckConstraint('"int" >= 0 AND "int" <= 100', name="ck_coc7_character_sheets_int_range"),
        sa.CheckConstraint('"pow" >= 0 AND "pow" <= 100', name="ck_coc7_character_sheets_pow_range"),
        sa.CheckConstraint('"edu" >= 0 AND "edu" <= 100', name="ck_coc7_character_sheets_edu_range"),
        sa.CheckConstraint('"luck" >= 0 AND "luck" <= 100', name="ck_coc7_character_sheets_luck_range"),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", name="uq_coc7_character_sheets_character_id"),
    )

    op.create_table(
        "dnd5e_character_sheets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("race", sa.String(length=255), nullable=True),
        sa.Column("class_name", sa.String(length=255), nullable=True),
        sa.Column("subclass", sa.String(length=255), nullable=True),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("background", sa.Text(), nullable=True),
        sa.Column("alignment", sa.String(length=100), nullable=True),
        sa.Column("player_name", sa.String(length=255), nullable=True),
        sa.Column("experience_points", sa.Integer(), nullable=False),
        sa.Column("strength", sa.Integer(), nullable=False),
        sa.Column("dexterity", sa.Integer(), nullable=False),
        sa.Column("constitution", sa.Integer(), nullable=False),
        sa.Column("intelligence", sa.Integer(), nullable=False),
        sa.Column("wisdom", sa.Integer(), nullable=False),
        sa.Column("charisma", sa.Integer(), nullable=False),
        sa.Column("armor_class", sa.Integer(), nullable=False),
        sa.Column("initiative", sa.Integer(), nullable=False),
        sa.Column("speed", sa.Integer(), nullable=False),
        sa.Column("max_hp", sa.Integer(), nullable=False),
        sa.Column("current_hp", sa.Integer(), nullable=False),
        sa.Column("temporary_hp", sa.Integer(), nullable=False),
        sa.Column("hit_dice", sa.String(length=50), nullable=True),
        sa.Column("proficiencies_json", sa.JSON(), nullable=False),
        sa.Column("skills_json", sa.JSON(), nullable=False),
        sa.Column("equipment_json", sa.JSON(), nullable=False),
        sa.Column("spellcasting_json", sa.JSON(), nullable=False),
        sa.Column("features_json", sa.JSON(), nullable=False),
        sa.Column("status_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("level >= 1 AND level <= 20", name="ck_dnd5e_character_sheets_level_range"),
        sa.CheckConstraint("strength >= 1 AND strength <= 30", name="ck_dnd5e_character_sheets_strength_range"),
        sa.CheckConstraint("dexterity >= 1 AND dexterity <= 30", name="ck_dnd5e_character_sheets_dexterity_range"),
        sa.CheckConstraint(
            "constitution >= 1 AND constitution <= 30",
            name="ck_dnd5e_character_sheets_constitution_range",
        ),
        sa.CheckConstraint(
            "intelligence >= 1 AND intelligence <= 30",
            name="ck_dnd5e_character_sheets_intelligence_range",
        ),
        sa.CheckConstraint("wisdom >= 1 AND wisdom <= 30", name="ck_dnd5e_character_sheets_wisdom_range"),
        sa.CheckConstraint("charisma >= 1 AND charisma <= 30", name="ck_dnd5e_character_sheets_charisma_range"),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", name="uq_dnd5e_character_sheets_character_id"),
    )


def downgrade() -> None:
    op.drop_table("dnd5e_character_sheets")
    op.drop_table("coc7_character_sheets")
    op.drop_index(op.f("ix_characters_user_id"), table_name="characters")
    op.drop_index(op.f("ix_characters_rule_system"), table_name="characters")
    op.drop_table("characters")
