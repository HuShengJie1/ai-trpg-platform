from collections.abc import Iterable

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.coc7_character import Coc7CharacterSheet
from app.models.coc7_skill import Coc7CharacterSkill, Coc7SkillDefinition, Coc7SkillSpecialization
from app.schemas.coc7_skill import (
    Coc7CharacterSkillInput,
    Coc7CharacterSkillRead,
    Coc7CharacterSkillsUpdate,
    Coc7SkillDefinitionRead,
    Coc7SkillSpecializationRead,
)


COC7_SKILL_DEFINITIONS = (
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

COC7_SKILL_SPECIALIZATIONS = {
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


def seed_coc7_skill_catalog(db: Session) -> None:
    if db.scalar(select(Coc7SkillDefinition.id).limit(1)) is not None:
        return

    definitions: dict[str, Coc7SkillDefinition] = {}
    for sort_order, row in enumerate(COC7_SKILL_DEFINITIONS, start=1):
        (
            key,
            name,
            category,
            base_value,
            base_formula,
            allows_specialization,
            allows_custom_specialization,
            is_custom,
        ) = row
        definition = Coc7SkillDefinition(
            key=key,
            name=name,
            category=category,
            base_value=base_value,
            base_formula=base_formula,
            allows_specialization=allows_specialization,
            allows_custom_specialization=allows_custom_specialization,
            is_custom=is_custom,
            sort_order=sort_order,
        )
        db.add(definition)
        definitions[key] = definition

    db.flush()

    for definition_key, specializations in COC7_SKILL_SPECIALIZATIONS.items():
        definition = definitions[definition_key]
        for sort_order, (key, name, base_value) in enumerate(specializations, start=1):
            db.add(
                Coc7SkillSpecialization(
                    skill_definition_id=definition.id,
                    key=key,
                    name=name,
                    base_value=base_value,
                    sort_order=sort_order,
                )
            )

    db.commit()


def list_coc7_skill_catalog(db: Session) -> list[Coc7SkillDefinitionRead]:
    definitions = db.scalars(
        select(Coc7SkillDefinition).order_by(Coc7SkillDefinition.sort_order)
    ).all()
    specializations = db.scalars(
        select(Coc7SkillSpecialization).order_by(
            Coc7SkillSpecialization.skill_definition_id,
            Coc7SkillSpecialization.sort_order,
        )
    ).all()
    grouped_specializations: dict[int, list[Coc7SkillSpecializationRead]] = {}
    for specialization in specializations:
        grouped_specializations.setdefault(specialization.skill_definition_id, []).append(
            Coc7SkillSpecializationRead.model_validate(specialization)
        )

    return [
        Coc7SkillDefinitionRead(
            key=definition.key,
            name=definition.name,
            category=definition.category,
            base_value=definition.base_value,
            base_formula=definition.base_formula,
            allows_specialization=definition.allows_specialization,
            allows_custom_specialization=definition.allows_custom_specialization,
            is_custom=definition.is_custom,
            sort_order=definition.sort_order,
            note=definition.note,
            specializations=grouped_specializations.get(definition.id, []),
        )
        for definition in definitions
    ]


def list_coc7_character_skills(
    db: Session,
    user_id: int,
    character_id: int,
) -> list[Coc7CharacterSkillRead]:
    sheet = _get_coc7_sheet_for_user(db, user_id, character_id)
    rows = db.execute(
        select(Coc7CharacterSkill, Coc7SkillDefinition, Coc7SkillSpecialization)
        .join(
            Coc7SkillDefinition,
            Coc7SkillDefinition.id == Coc7CharacterSkill.skill_definition_id,
        )
        .outerjoin(
            Coc7SkillSpecialization,
            Coc7SkillSpecialization.id == Coc7CharacterSkill.skill_specialization_id,
        )
        .where(Coc7CharacterSkill.character_sheet_id == sheet.id)
        .order_by(Coc7CharacterSkill.sort_order, Coc7CharacterSkill.id)
    ).all()

    return [
        _build_character_skill_read(character_skill, definition, specialization)
        for character_skill, definition, specialization in rows
    ]


def replace_coc7_character_skills(
    db: Session,
    user_id: int,
    character_id: int,
    payload: Coc7CharacterSkillsUpdate,
) -> list[Coc7CharacterSkillRead]:
    sheet = _get_coc7_sheet_for_user(db, user_id, character_id)
    skill_keys = {skill.skill_key for skill in payload.skills}
    definitions = {
        definition.key: definition
        for definition in db.scalars(
            select(Coc7SkillDefinition).where(Coc7SkillDefinition.key.in_(skill_keys))
        ).all()
    }
    if missing_keys := sorted(skill_keys - definitions.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown COC7 skill keys: {', '.join(missing_keys)}",
        )

    definition_ids = [definition.id for definition in definitions.values()]
    specializations = db.scalars(
        select(Coc7SkillSpecialization).where(
            Coc7SkillSpecialization.skill_definition_id.in_(definition_ids)
        )
    ).all()
    specializations_by_definition = _group_specializations(specializations)

    identities: set[tuple[str, str | None, str | None, str | None]] = set()
    prepared_rows: list[Coc7CharacterSkill] = []
    for index, skill_input in enumerate(payload.skills):
        definition = definitions[skill_input.skill_key]
        specialization = _resolve_specialization(
            definition,
            skill_input,
            specializations_by_definition.get(definition.id, {}),
        )
        identity = (
            definition.key,
            specialization.key if specialization else None,
            skill_input.custom_name,
            skill_input.custom_specialization,
        )
        if identity in identities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate COC7 skill entry at index {index}",
            )
        identities.add(identity)

        prepared_rows.append(
            Coc7CharacterSkill(
                character_sheet_id=sheet.id,
                skill_definition_id=definition.id,
                skill_specialization_id=specialization.id if specialization else None,
                custom_name=skill_input.custom_name,
                custom_specialization=skill_input.custom_specialization,
                base_value=_resolve_base_value(sheet, definition, specialization, skill_input),
                occupation_points=skill_input.occupation_points,
                interest_points=skill_input.interest_points,
                growth_points=skill_input.growth_points,
                is_occupation=skill_input.is_occupation,
                improvement_checked=skill_input.improvement_checked,
                sort_order=skill_input.sort_order or index + 1,
            )
        )

    db.execute(
        delete(Coc7CharacterSkill).where(Coc7CharacterSkill.character_sheet_id == sheet.id)
    )
    db.add_all(prepared_rows)
    db.commit()
    return list_coc7_character_skills(db, user_id, character_id)


def _get_coc7_sheet_for_user(
    db: Session,
    user_id: int,
    character_id: int,
) -> Coc7CharacterSheet:
    sheet = db.scalar(
        select(Coc7CharacterSheet)
        .join(Character, Character.id == Coc7CharacterSheet.character_id)
        .where(
            Coc7CharacterSheet.character_id == character_id,
            Character.user_id == user_id,
            Character.rule_system == "coc7",
        )
    )
    if sheet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="COC7 character not found",
        )
    return sheet


def _group_specializations(
    specializations: Iterable[Coc7SkillSpecialization],
) -> dict[int, dict[str, Coc7SkillSpecialization]]:
    grouped: dict[int, dict[str, Coc7SkillSpecialization]] = {}
    for specialization in specializations:
        grouped.setdefault(specialization.skill_definition_id, {})[
            specialization.key
        ] = specialization
    return grouped


def _resolve_specialization(
    definition: Coc7SkillDefinition,
    skill_input: Coc7CharacterSkillInput,
    available: dict[str, Coc7SkillSpecialization],
) -> Coc7SkillSpecialization | None:
    if not definition.allows_specialization:
        if skill_input.specialization_key or skill_input.custom_specialization:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Skill '{definition.key}' does not allow a specialization",
            )
        if definition.is_custom and not skill_input.custom_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom COC7 skills require custom_name",
            )
        if not definition.is_custom and skill_input.custom_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Skill '{definition.key}' does not allow custom_name",
            )
        return None

    if skill_input.specialization_key and skill_input.custom_specialization:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Skill '{definition.key}' accepts only one specialization source",
        )
    if skill_input.specialization_key:
        specialization = available.get(skill_input.specialization_key)
        if specialization is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unknown specialization '{skill_input.specialization_key}' "
                    f"for skill '{definition.key}'"
                ),
            )
        return specialization
    if skill_input.custom_specialization and definition.allows_custom_specialization:
        return None

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Skill '{definition.key}' requires a specialization",
    )


def _resolve_base_value(
    sheet: Coc7CharacterSheet,
    definition: Coc7SkillDefinition,
    specialization: Coc7SkillSpecialization | None,
    skill_input: Coc7CharacterSkillInput,
) -> int:
    if definition.base_formula == "edu":
        return sheet.edu
    if definition.base_formula == "dex_half":
        return sheet.dex // 2
    if specialization is not None:
        return specialization.base_value
    if definition.is_custom:
        return skill_input.base_value if skill_input.base_value is not None else 0
    if skill_input.custom_specialization:
        return (
            skill_input.base_value
            if skill_input.base_value is not None
            else definition.base_value or 0
        )
    return definition.base_value or 0


def _build_character_skill_read(
    character_skill: Coc7CharacterSkill,
    definition: Coc7SkillDefinition,
    specialization: Coc7SkillSpecialization | None,
) -> Coc7CharacterSkillRead:
    return Coc7CharacterSkillRead(
        id=character_skill.id,
        skill_key=definition.key,
        name=character_skill.custom_name or definition.name,
        category=definition.category,
        specialization_key=specialization.key if specialization else None,
        specialization_name=(
            specialization.name if specialization else character_skill.custom_specialization
        ),
        custom_name=character_skill.custom_name,
        custom_specialization=character_skill.custom_specialization,
        base_value=character_skill.base_value,
        occupation_points=character_skill.occupation_points,
        interest_points=character_skill.interest_points,
        growth_points=character_skill.growth_points,
        is_occupation=character_skill.is_occupation,
        improvement_checked=character_skill.improvement_checked,
        sort_order=character_skill.sort_order,
        created_at=character_skill.created_at,
        updated_at=character_skill.updated_at,
    )
