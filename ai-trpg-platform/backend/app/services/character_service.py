from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.character import Character
from app.schemas.character import CharacterListItem, CharacterRead, SupportedRuleRead
from app.schemas.coc7_character import Coc7CharacterCreate, Coc7CharacterSheetRead, Coc7CharacterUpdate
from app.schemas.dnd5e_character import (
    Dnd5eCharacterCreate,
    Dnd5eCharacterSheetRead,
    Dnd5eCharacterUpdate,
)
from app.services.coc7_character_service import (
    COC7_RULE_SYSTEM,
    build_coc7_summary,
    create_coc7_character,
    get_coc7_character,
    update_coc7_character,
)
from app.services.dnd5e_character_service import (
    DND5E_RULE_SYSTEM,
    build_dnd5e_summary,
    create_dnd5e_character,
    get_dnd5e_character,
    update_dnd5e_character,
)


SUPPORTED_RULES = (
    SupportedRuleRead(
        id=COC7_RULE_SYSTEM,
        name="COC7",
        description="Call of Cthulhu 7th Edition character sheet",
    ),
    SupportedRuleRead(
        id=DND5E_RULE_SYSTEM,
        name="DND5E",
        description="Dungeons & Dragons 5th Edition character sheet",
    ),
)


def get_supported_rules() -> list[SupportedRuleRead]:
    return list(SUPPORTED_RULES)


def get_character_by_id_for_user(db: Session, user_id: int, character_id: int) -> Character:
    character = db.scalar(
        select(Character).where(Character.id == character_id, Character.user_id == user_id)
    )
    if character is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    return character


def list_characters_by_user(db: Session, user_id: int) -> list[CharacterListItem]:
    characters = db.scalars(
        select(Character)
        .where(Character.user_id == user_id)
        .order_by(Character.created_at.desc(), Character.id.desc())
    ).all()

    return [
        CharacterListItem(
            id=character.id,
            user_id=character.user_id,
            rule_system=character.rule_system,
            name=character.name,
            summary=_build_summary(db, character),
            created_at=character.created_at,
            updated_at=character.updated_at,
        )
        for character in characters
    ]


def create_character(
    db: Session,
    user_id: int,
    rule_system: str,
    character_create: Coc7CharacterCreate | Dnd5eCharacterCreate,
) -> CharacterRead:
    if rule_system == COC7_RULE_SYSTEM and isinstance(character_create, Coc7CharacterCreate):
        character, sheet = create_coc7_character(db, user_id, character_create)
        return _build_character_read(character, _serialize_coc7_sheet(sheet))

    if rule_system == DND5E_RULE_SYSTEM and isinstance(character_create, Dnd5eCharacterCreate):
        character, sheet = create_dnd5e_character(db, user_id, character_create)
        return _build_character_read(character, _serialize_dnd5e_sheet(sheet))

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported character rule system",
    )


def get_character_detail(db: Session, user_id: int, character_id: int) -> CharacterRead:
    character = get_character_by_id_for_user(db, user_id, character_id)
    sheet = _get_serialized_sheet(db, character)
    return _build_character_read(character, sheet)


def update_character(
    db: Session,
    user_id: int,
    character_id: int,
    rule_system: str,
    character_update: Coc7CharacterUpdate | Dnd5eCharacterUpdate,
) -> CharacterRead:
    character = get_character_by_id_for_user(db, user_id, character_id)
    if character.rule_system != rule_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Character is not a {rule_system} character",
        )

    if rule_system == COC7_RULE_SYSTEM and isinstance(character_update, Coc7CharacterUpdate):
        character, sheet = update_coc7_character(db, character, character_update)
        return _build_character_read(character, _serialize_coc7_sheet(sheet))

    if rule_system == DND5E_RULE_SYSTEM and isinstance(character_update, Dnd5eCharacterUpdate):
        character, sheet = update_dnd5e_character(db, character, character_update)
        return _build_character_read(character, _serialize_dnd5e_sheet(sheet))

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported character rule system",
    )


def delete_character(db: Session, user_id: int, character_id: int) -> None:
    character = get_character_by_id_for_user(db, user_id, character_id)

    if character.rule_system == COC7_RULE_SYSTEM:
        sheet = get_coc7_character(db, character.id)
        if sheet is not None:
            db.delete(sheet)
    elif character.rule_system == DND5E_RULE_SYSTEM:
        sheet = get_dnd5e_character(db, character.id)
        if sheet is not None:
            db.delete(sheet)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported character rule system",
        )

    db.delete(character)
    db.commit()


def _build_summary(db: Session, character: Character) -> str:
    if character.rule_system == COC7_RULE_SYSTEM:
        return build_coc7_summary(get_coc7_character(db, character.id))

    if character.rule_system == DND5E_RULE_SYSTEM:
        return build_dnd5e_summary(get_dnd5e_character(db, character.id))

    return "Unsupported character rule system"


def _get_serialized_sheet(db: Session, character: Character) -> dict[str, Any]:
    if character.rule_system == COC7_RULE_SYSTEM:
        sheet = get_coc7_character(db, character.id)
        if sheet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="COC7 character sheet not found",
            )
        return _serialize_coc7_sheet(sheet)

    if character.rule_system == DND5E_RULE_SYSTEM:
        sheet = get_dnd5e_character(db, character.id)
        if sheet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DND5E character sheet not found",
            )
        return _serialize_dnd5e_sheet(sheet)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported character rule system",
    )


def _serialize_coc7_sheet(sheet: Any) -> dict[str, Any]:
    return Coc7CharacterSheetRead.model_validate(sheet).model_dump(mode="json")


def _serialize_dnd5e_sheet(sheet: Any) -> dict[str, Any]:
    return Dnd5eCharacterSheetRead.model_validate(sheet).model_dump(mode="json")


def _build_character_read(character: Character, sheet: dict[str, Any]) -> CharacterRead:
    return CharacterRead(
        id=character.id,
        user_id=character.user_id,
        rule_system=character.rule_system,
        name=character.name,
        sheet=sheet,
        created_at=character.created_at,
        updated_at=character.updated_at,
    )
