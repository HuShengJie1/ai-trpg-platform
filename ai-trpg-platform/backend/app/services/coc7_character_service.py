from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.coc7_character import Coc7CharacterSheet
from app.schemas.coc7_character import Coc7CharacterCreate, Coc7CharacterUpdate


COC7_RULE_SYSTEM = "coc7"
COC7_ATTRIBUTE_FIELDS = ("str", "con", "siz", "dex", "app", "int", "pow", "edu", "luck")
COC7_SHEET_FIELDS = (
    "occupation",
    "age",
    "gender",
    "residence",
    "birthplace",
    "background",
    "str",
    "con",
    "siz",
    "dex",
    "app",
    "int",
    "pow",
    "edu",
    "luck",
    "hp",
    "mp",
    "san",
    "build",
    "damage_bonus",
    "move",
    "skills_json",
    "equipment_json",
    "backstory_json",
    "status_json",
)
COC7_REQUIRED_SHEET_FIELDS = {
    "str",
    "con",
    "siz",
    "dex",
    "app",
    "int",
    "pow",
    "edu",
    "luck",
    "hp",
    "mp",
    "san",
    "build",
    "move",
    "skills_json",
    "equipment_json",
    "backstory_json",
    "status_json",
}
COC7_MODEL_FIELD_MAP = {
    "str": "str_score",
    "int": "int_score",
}


def get_coc7_character(db: Session, character_id: int) -> Coc7CharacterSheet | None:
    return db.scalar(
        select(Coc7CharacterSheet).where(Coc7CharacterSheet.character_id == character_id)
    )


def validate_coc7_data(data: dict[str, Any]) -> None:
    for field in COC7_ATTRIBUTE_FIELDS:
        value = data.get(field)
        if value is not None and not 0 <= value <= 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"COC7 attribute '{field}' must be between 0 and 100",
            )


def create_coc7_character(
    db: Session,
    user_id: int,
    character_create: Coc7CharacterCreate,
) -> tuple[Character, Coc7CharacterSheet]:
    data = character_create.model_dump()
    validate_coc7_data(data)

    character = Character(
        user_id=user_id,
        rule_system=COC7_RULE_SYSTEM,
        name=character_create.name,
    )
    db.add(character)

    try:
        db.flush()
        sheet_data = _to_model_sheet_data(character_create.model_dump(exclude={"name"}))
        sheet = Coc7CharacterSheet(character_id=character.id, **sheet_data)
        db.add(sheet)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create COC7 character",
        ) from None

    db.refresh(character)
    db.refresh(sheet)
    return character, sheet


def update_coc7_character(
    db: Session,
    character: Character,
    character_update: Coc7CharacterUpdate,
) -> tuple[Character, Coc7CharacterSheet]:
    sheet = get_coc7_character(db, character.id)
    if sheet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="COC7 character sheet not found",
        )

    updates = character_update.model_dump(exclude_unset=True)
    validate_coc7_data(updates)

    if "name" in updates:
        if updates["name"] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Character name cannot be null",
            )
        character.name = updates["name"]

    for field in COC7_SHEET_FIELDS:
        if field not in updates:
            continue
        if updates[field] is None and field in COC7_REQUIRED_SHEET_FIELDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"COC7 field '{field}' cannot be null",
            )
        setattr(sheet, COC7_MODEL_FIELD_MAP.get(field, field), updates[field])

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update COC7 character",
        ) from None

    db.refresh(character)
    db.refresh(sheet)
    return character, sheet


def build_coc7_summary(sheet: Coc7CharacterSheet | None) -> str:
    if sheet is None:
        return "COC7 sheet missing"

    occupation = sheet.occupation or "unknown occupation"
    return f"COC7 | {occupation} | HP {sheet.hp} | SAN {sheet.san}"


def _to_model_sheet_data(data: dict[str, Any]) -> dict[str, Any]:
    return {COC7_MODEL_FIELD_MAP.get(field, field): value for field, value in data.items()}
