from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.dnd5e_character import Dnd5eCharacterSheet
from app.schemas.dnd5e_character import Dnd5eCharacterCreate, Dnd5eCharacterUpdate


DND5E_RULE_SYSTEM = "dnd5e"
DND5E_ABILITY_FIELDS = (
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
)
DND5E_SHEET_FIELDS = (
    "race",
    "class_name",
    "subclass",
    "level",
    "background",
    "alignment",
    "player_name",
    "experience_points",
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
    "armor_class",
    "initiative",
    "speed",
    "max_hp",
    "current_hp",
    "temporary_hp",
    "hit_dice",
    "proficiencies_json",
    "skills_json",
    "equipment_json",
    "spellcasting_json",
    "features_json",
    "status_json",
)
DND5E_REQUIRED_SHEET_FIELDS = {
    "level",
    "experience_points",
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
    "armor_class",
    "initiative",
    "speed",
    "max_hp",
    "current_hp",
    "temporary_hp",
    "proficiencies_json",
    "skills_json",
    "equipment_json",
    "spellcasting_json",
    "features_json",
    "status_json",
}


def get_dnd5e_character(db: Session, character_id: int) -> Dnd5eCharacterSheet | None:
    return db.scalar(
        select(Dnd5eCharacterSheet).where(Dnd5eCharacterSheet.character_id == character_id)
    )


def validate_dnd5e_data(data: dict[str, Any]) -> None:
    level = data.get("level")
    if level is not None and not 1 <= level <= 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DND5E level must be between 1 and 20",
        )

    for field in DND5E_ABILITY_FIELDS:
        value = data.get(field)
        if value is not None and not 1 <= value <= 30:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"DND5E ability score '{field}' must be between 1 and 30",
            )


def create_dnd5e_character(
    db: Session,
    user_id: int,
    character_create: Dnd5eCharacterCreate,
) -> tuple[Character, Dnd5eCharacterSheet]:
    data = character_create.model_dump()
    validate_dnd5e_data(data)

    character = Character(
        user_id=user_id,
        rule_system=DND5E_RULE_SYSTEM,
        name=character_create.name,
    )
    db.add(character)

    try:
        db.flush()
        sheet_data = character_create.model_dump(exclude={"name"})
        sheet = Dnd5eCharacterSheet(character_id=character.id, **sheet_data)
        db.add(sheet)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create DND5E character",
        ) from None

    db.refresh(character)
    db.refresh(sheet)
    return character, sheet


def update_dnd5e_character(
    db: Session,
    character: Character,
    character_update: Dnd5eCharacterUpdate,
) -> tuple[Character, Dnd5eCharacterSheet]:
    sheet = get_dnd5e_character(db, character.id)
    if sheet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DND5E character sheet not found",
        )

    updates = character_update.model_dump(exclude_unset=True)
    validate_dnd5e_data(updates)

    if "name" in updates:
        if updates["name"] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Character name cannot be null",
            )
        character.name = updates["name"]

    for field in DND5E_SHEET_FIELDS:
        if field not in updates:
            continue
        if updates[field] is None and field in DND5E_REQUIRED_SHEET_FIELDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"DND5E field '{field}' cannot be null",
            )
        setattr(sheet, field, updates[field])

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update DND5E character",
        ) from None

    db.refresh(character)
    db.refresh(sheet)
    return character, sheet


def build_dnd5e_summary(sheet: Dnd5eCharacterSheet | None) -> str:
    if sheet is None:
        return "DND5E sheet missing"

    race = sheet.race or "unknown race"
    class_name = sheet.class_name or "unknown class"
    return f"DND5E | Level {sheet.level} {race} {class_name} | HP {sheet.current_hp}/{sheet.max_hp}"
