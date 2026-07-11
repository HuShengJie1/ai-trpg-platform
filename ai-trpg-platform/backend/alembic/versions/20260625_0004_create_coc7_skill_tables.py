"""create coc7 skill tables

Revision ID: 20260625_0004
Revises: 20260613_0003
Create Date: 2026-06-25 00:00:00.000000
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260625_0004"
down_revision: str | Sequence[str] | None = "20260613_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


SKILL_DEFINITIONS = (
    ("credit_rating", "信用评级", "social", 0, None, False, False, False),
    ("cthulhu_mythos", "克苏鲁神话", "mythos", 0, None, False, False, False),
    ("spot_hidden", "侦查", "investigation", 25, None, False, False, False),
    ("listen", "聆听", "investigation", 20, None, False, False, False),
    ("stealth", "潜行", "physical", 20, None, False, False, False),
    ("track", "追踪", "investigation", 10, None, False, False, False),
    ("lip_reading", "读唇", "investigation", 1, None, False, False, False),
    ("library_use", "图书馆使用", "investigation", 20, None, False, False, False),
    ("navigate", "导航", "investigation", 10, None, False, False, False),
    ("computer_use", "计算机使用", "technical", 5, None, False, False, False),
    ("charm", "取悦", "social", 15, None, False, False, False),
    ("fast_talk", "话术", "social", 5, None, False, False, False),
    ("intimidate", "恐吓", "social", 15, None, False, False, False),
    ("persuade", "说服", "social", 10, None, False, False, False),
    ("psychology", "心理学", "social", 10, None, False, False, False),
    ("own_language", "母语", "language", None, "edu", False, False, False),
    ("foreign_language", "外语", "language", 1, None, True, True, False),
    ("fighting", "格斗", "combat", None, "specialization", True, True, False),
    ("firearms", "射击", "combat", None, "specialization", True, True, False),
    ("dodge", "闪避", "combat", None, "dex_half", False, False, False),
    ("throw", "投掷", "combat", 20, None, False, False, False),
    ("demolitions", "爆破", "technical", 1, None, False, False, False),
    ("running", "跑术", "physical", 1, None, False, False, False),
    ("first_aid", "急救", "medical", 30, None, False, False, False),
    ("medicine", "医学", "medical", 1, None, False, False, False),
    ("psychoanalysis", "精神分析", "medical", 1, None, False, False, False),
    ("hypnosis", "催眠", "medical", 1, None, False, False, False),
    ("climb", "攀爬", "physical", 20, None, False, False, False),
    ("jump", "跳跃", "physical", 20, None, False, False, False),
    ("swim", "游泳", "physical", 20, None, False, False, False),
    ("dive", "潜水", "physical", 1, None, False, False, False),
    ("appraise", "估价", "knowledge", 5, None, False, False, False),
    ("anthropology", "人类学", "knowledge", 1, None, False, False, False),
    ("accounting", "会计", "knowledge", 5, None, False, False, False),
    ("law", "法律", "knowledge", 5, None, False, False, False),
    ("history", "历史", "knowledge", 5, None, False, False, False),
    ("archaeology", "考古学", "knowledge", 1, None, False, False, False),
    ("natural_world", "博物学", "knowledge", 10, None, False, False, False),
    ("occult", "神秘学", "knowledge", 5, None, False, False, False),
    ("electronics", "电子学", "technical", 1, None, False, False, False),
    ("science", "科学", "knowledge", 1, "specialization", True, True, False),
    ("disguise", "乔装", "social", 5, None, False, False, False),
    ("survival", "生存", "survival", 5, None, True, True, False),
    ("art_craft", "技艺", "technical", 5, None, True, True, False),
    ("sleight_of_hand", "妙手", "physical", 10, None, False, False, False),
    ("locksmith", "锁匠", "technical", 1, None, False, False, False),
    ("electrical_repair", "电气维修", "technical", 10, None, False, False, False),
    ("mechanical_repair", "机械维修", "technical", 10, None, False, False, False),
    ("animal_handling", "驯兽", "survival", 5, None, False, False, False),
    ("ride", "骑术", "transport", 5, None, False, False, False),
    (
        "operate_heavy_machinery",
        "操作重型机械",
        "transport",
        1,
        None,
        False,
        False,
        False,
    ),
    ("drive_auto", "汽车驾驶", "transport", 20, None, False, False, False),
    ("pilot", "驾驶", "transport", 1, None, True, True, False),
    ("custom", "自定义", "custom", 0, None, False, False, True),
)

SKILL_SPECIALIZATIONS = {
    "foreign_language": (
        ("chinese", "汉语", 1),
        ("english", "英语", 1),
        ("japanese", "日语", 1),
        ("french", "法语", 1),
        ("russian", "俄语", 1),
        ("german", "德语", 1),
        ("korean", "韩语", 1),
        ("cantonese", "粤语", 1),
        ("latin", "拉丁语", 1),
        ("dutch", "荷兰语", 1),
        ("norwegian", "挪威语", 1),
        ("danish", "丹麦语", 1),
        ("hindi", "印度语", 1),
        ("spanish", "西班牙语", 1),
        ("portuguese", "葡萄牙语", 1),
        ("arabic", "阿拉伯语", 1),
    ),
    "fighting": (
        ("brawl", "斗殴", 25),
        ("sword", "刀剑", 20),
        ("spear", "矛", 20),
        ("axe", "斧", 15),
        ("garrote", "绞索", 15),
        ("chainsaw", "链锯", 10),
        ("flail", "链枷", 10),
        ("whip", "鞭", 5),
    ),
    "firearms": (
        ("handgun", "手枪", 20),
        ("rifle_shotgun", "步枪/霰弹枪", 25),
        ("submachine_gun", "冲锋枪", 15),
        ("bow_crossbow", "弓弩", 15),
        ("machine_gun", "机枪", 10),
        ("heavy_weapons", "重武器", 10),
    ),
    "science": (
        ("mathematics", "数学", 10),
        ("physics", "物理", 1),
        ("chemistry", "化学", 1),
        ("pharmacy", "药学", 1),
        ("geology", "地质学", 1),
        ("biology", "生物学", 1),
        ("zoology", "动物学", 1),
        ("botany", "植物学", 1),
        ("astronomy", "天文学", 1),
        ("cryptography", "密码学", 1),
        ("meteorology", "气象学", 1),
        ("engineering", "工程学", 1),
        ("forensics", "鉴证", 1),
        ("pharmaceutics", "制药", 1),
    ),
    "survival": (
        ("desert", "沙漠", 5),
        ("forest", "森林", 5),
        ("island", "荒岛", 5),
        ("mountain", "高山", 5),
        ("sea", "海上", 5),
    ),
    "art_craft": (
        ("acting", "表演", 5),
        ("music", "音乐", 5),
        ("painting", "绘画", 5),
        ("art", "艺术", 5),
        ("photography", "摄影", 5),
        ("writing", "写作", 5),
        ("calligraphy", "书法", 5),
        ("typing", "打字", 5),
        ("shorthand", "速记", 5),
        ("forgery", "伪造", 5),
        ("cooking", "烹饪", 5),
        ("tailoring", "裁缝", 5),
        ("hairdressing", "理发", 5),
        ("technical_drawing", "技术制图", 5),
        ("farming", "耕作", 5),
        ("carpentry", "木工", 5),
        ("blacksmithing", "铁匠", 5),
        ("welding", "焊接", 5),
        ("plumbing", "管道工", 5),
    ),
    "pilot": (
        ("boat", "船", 1),
        ("carriage", "马车", 1),
        ("aircraft", "飞行器", 1),
    ),
}


def upgrade() -> None:
    op.create_table(
        "coc7_skill_definitions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("base_value", sa.Integer(), nullable=True),
        sa.Column("base_formula", sa.String(length=50), nullable=True),
        sa.Column("allows_specialization", sa.Boolean(), nullable=False),
        sa.Column("allows_custom_specialization", sa.Boolean(), nullable=False),
        sa.Column("is_custom", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "base_value IS NULL OR (base_value >= 0 AND base_value <= 100)",
            name="ck_coc7_skill_definitions_base_value_range",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key", name="uq_coc7_skill_definitions_key"),
    )
    op.create_index(
        op.f("ix_coc7_skill_definitions_category"),
        "coc7_skill_definitions",
        ["category"],
        unique=False,
    )
    op.create_index(
        op.f("ix_coc7_skill_definitions_key"),
        "coc7_skill_definitions",
        ["key"],
        unique=True,
    )

    op.create_table(
        "coc7_skill_specializations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("skill_definition_id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("base_value", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "base_value >= 0 AND base_value <= 100",
            name="ck_coc7_skill_specializations_base_value_range",
        ),
        sa.ForeignKeyConstraint(
            ["skill_definition_id"],
            ["coc7_skill_definitions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "skill_definition_id",
            "key",
            name="uq_coc7_skill_specializations_definition_key",
        ),
    )
    op.create_index(
        op.f("ix_coc7_skill_specializations_skill_definition_id"),
        "coc7_skill_specializations",
        ["skill_definition_id"],
        unique=False,
    )

    op.create_table(
        "coc7_character_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_sheet_id", sa.Integer(), nullable=False),
        sa.Column("skill_definition_id", sa.Integer(), nullable=False),
        sa.Column("skill_specialization_id", sa.Integer(), nullable=True),
        sa.Column("custom_name", sa.String(length=100), nullable=True),
        sa.Column("custom_specialization", sa.String(length=100), nullable=True),
        sa.Column("base_value", sa.Integer(), nullable=False),
        sa.Column("occupation_points", sa.Integer(), nullable=False),
        sa.Column("interest_points", sa.Integer(), nullable=False),
        sa.Column("growth_points", sa.Integer(), nullable=False),
        sa.Column("is_occupation", sa.Boolean(), nullable=False),
        sa.Column("improvement_checked", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "base_value >= 0 AND base_value <= 100",
            name="ck_coc7_character_skills_base_value_range",
        ),
        sa.CheckConstraint(
            "occupation_points >= 0",
            name="ck_coc7_character_skills_occupation_points_nonnegative",
        ),
        sa.CheckConstraint(
            "interest_points >= 0",
            name="ck_coc7_character_skills_interest_points_nonnegative",
        ),
        sa.CheckConstraint(
            "growth_points >= 0",
            name="ck_coc7_character_skills_growth_points_nonnegative",
        ),
        sa.ForeignKeyConstraint(
            ["character_sheet_id"],
            ["coc7_character_sheets.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["skill_definition_id"],
            ["coc7_skill_definitions.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["skill_specialization_id"],
            ["coc7_skill_specializations.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_coc7_character_skills_character_sheet_id"),
        "coc7_character_skills",
        ["character_sheet_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_coc7_character_skills_skill_definition_id"),
        "coc7_character_skills",
        ["skill_definition_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_coc7_character_skills_skill_specialization_id"),
        "coc7_character_skills",
        ["skill_specialization_id"],
        unique=False,
    )

    definition_table = sa.table(
        "coc7_skill_definitions",
        sa.column("id", sa.Integer()),
        sa.column("key", sa.String()),
        sa.column("name", sa.String()),
        sa.column("category", sa.String()),
        sa.column("base_value", sa.Integer()),
        sa.column("base_formula", sa.String()),
        sa.column("allows_specialization", sa.Boolean()),
        sa.column("allows_custom_specialization", sa.Boolean()),
        sa.column("is_custom", sa.Boolean()),
        sa.column("sort_order", sa.Integer()),
    )
    definition_ids = {
        row[0]: index for index, row in enumerate(SKILL_DEFINITIONS, start=1)
    }
    op.bulk_insert(
        definition_table,
        [
            {
                "id": definition_ids[key],
                "key": key,
                "name": name,
                "category": category,
                "base_value": base_value,
                "base_formula": base_formula,
                "allows_specialization": allows_specialization,
                "allows_custom_specialization": allows_custom_specialization,
                "is_custom": is_custom,
                "sort_order": sort_order,
            }
            for sort_order, (
                key,
                name,
                category,
                base_value,
                base_formula,
                allows_specialization,
                allows_custom_specialization,
                is_custom,
            ) in enumerate(SKILL_DEFINITIONS, start=1)
        ],
    )

    specialization_table = sa.table(
        "coc7_skill_specializations",
        sa.column("id", sa.Integer()),
        sa.column("skill_definition_id", sa.Integer()),
        sa.column("key", sa.String()),
        sa.column("name", sa.String()),
        sa.column("base_value", sa.Integer()),
        sa.column("sort_order", sa.Integer()),
    )
    specialization_rows = []
    specialization_id = 1
    for definition_key, specializations in SKILL_SPECIALIZATIONS.items():
        for sort_order, (key, name, base_value) in enumerate(specializations, start=1):
            specialization_rows.append(
                {
                    "id": specialization_id,
                    "skill_definition_id": definition_ids[definition_key],
                    "key": key,
                    "name": name,
                    "base_value": base_value,
                    "sort_order": sort_order,
                }
            )
            specialization_id += 1
    op.bulk_insert(specialization_table, specialization_rows)
    op.execute(
        sa.text(
            "SELECT setval("
            "pg_get_serial_sequence('coc7_skill_definitions', 'id'), "
            "(SELECT MAX(id) FROM coc7_skill_definitions)"
            ")"
        )
    )
    op.execute(
        sa.text(
            "SELECT setval("
            "pg_get_serial_sequence('coc7_skill_specializations', 'id'), "
            "(SELECT MAX(id) FROM coc7_skill_specializations)"
            ")"
        )
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_coc7_character_skills_skill_specialization_id"),
        table_name="coc7_character_skills",
    )
    op.drop_index(
        op.f("ix_coc7_character_skills_skill_definition_id"),
        table_name="coc7_character_skills",
    )
    op.drop_index(
        op.f("ix_coc7_character_skills_character_sheet_id"),
        table_name="coc7_character_skills",
    )
    op.drop_table("coc7_character_skills")
    op.drop_index(
        op.f("ix_coc7_skill_specializations_skill_definition_id"),
        table_name="coc7_skill_specializations",
    )
    op.drop_table("coc7_skill_specializations")
    op.drop_index(op.f("ix_coc7_skill_definitions_key"), table_name="coc7_skill_definitions")
    op.drop_index(
        op.f("ix_coc7_skill_definitions_category"),
        table_name="coc7_skill_definitions",
    )
    op.drop_table("coc7_skill_definitions")
