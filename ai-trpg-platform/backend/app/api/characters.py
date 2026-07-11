from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.character import CharacterListItem, CharacterRead, SupportedRuleRead
from app.schemas.coc7_character import Coc7CharacterCreate, Coc7CharacterUpdate
from app.schemas.coc7_occupation import Coc7OccupationRead
from app.schemas.coc7_skill import (
    Coc7CharacterSkillRead,
    Coc7CharacterSkillsUpdate,
    Coc7SkillDefinitionRead,
)
from app.schemas.dnd5e_character import Dnd5eCharacterCreate, Dnd5eCharacterUpdate
from app.services.character_service import (
    create_character,
    delete_character,
    get_character_detail,
    get_supported_rules,
    list_characters_by_user,
    update_character,
)
from app.services.coc7_character_service import COC7_RULE_SYSTEM
from app.services.coc7_occupation_service import (
    get_coc7_occupation,
    list_coc7_occupations,
)
from app.services.coc7_skill_service import (
    list_coc7_character_skills,
    list_coc7_skill_catalog,
    replace_coc7_character_skills,
)
from app.services.dnd5e_character_service import DND5E_RULE_SYSTEM

router = APIRouter()


@router.get("/rules", response_model=list[SupportedRuleRead])
def read_supported_rules() -> list[SupportedRuleRead]:
    return get_supported_rules()


@router.get("/coc7/skill-catalog", response_model=list[Coc7SkillDefinitionRead])
def read_coc7_skill_catalog(db: Session = Depends(get_db)) -> list[Coc7SkillDefinitionRead]:
    return list_coc7_skill_catalog(db)


@router.get("/coc7/occupations", response_model=list[Coc7OccupationRead])
def read_coc7_occupations(
    search: str | None = Query(default=None, max_length=255),
    db: Session = Depends(get_db),
) -> list[Coc7OccupationRead]:
    return list_coc7_occupations(db, search)


@router.get("/coc7/occupations/{occupation_id}", response_model=Coc7OccupationRead)
def read_coc7_occupation(
    occupation_id: int,
    db: Session = Depends(get_db),
) -> Coc7OccupationRead:
    return get_coc7_occupation(db, occupation_id)


@router.post(
    "/coc7",
    response_model=CharacterRead,
    status_code=status.HTTP_201_CREATED,
)
def create_coc7_character_endpoint(
    character_create: Coc7CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CharacterRead:
    return create_character(db, current_user.id, COC7_RULE_SYSTEM, character_create)


@router.post(
    "/dnd5e",
    response_model=CharacterRead,
    status_code=status.HTTP_201_CREATED,
)
def create_dnd5e_character_endpoint(
    character_create: Dnd5eCharacterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CharacterRead:
    return create_character(db, current_user.id, DND5E_RULE_SYSTEM, character_create)


@router.get("", response_model=list[CharacterListItem])
def list_characters_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CharacterListItem]:
    return list_characters_by_user(db, current_user.id)


@router.get("/{character_id}", response_model=CharacterRead)
def get_character_endpoint(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CharacterRead:
    return get_character_detail(db, current_user.id, character_id)


@router.put("/coc7/{character_id}", response_model=CharacterRead)
def update_coc7_character_endpoint(
    character_id: int,
    character_update: Coc7CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CharacterRead:
    return update_character(db, current_user.id, character_id, COC7_RULE_SYSTEM, character_update)


@router.get(
    "/coc7/{character_id}/skills",
    response_model=list[Coc7CharacterSkillRead],
)
def read_coc7_character_skills(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Coc7CharacterSkillRead]:
    return list_coc7_character_skills(db, current_user.id, character_id)


@router.put(
    "/coc7/{character_id}/skills",
    response_model=list[Coc7CharacterSkillRead],
)
def replace_coc7_character_skills_endpoint(
    character_id: int,
    payload: Coc7CharacterSkillsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Coc7CharacterSkillRead]:
    return replace_coc7_character_skills(db, current_user.id, character_id, payload)


@router.put("/dnd5e/{character_id}", response_model=CharacterRead)
def update_dnd5e_character_endpoint(
    character_id: int,
    character_update: Dnd5eCharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CharacterRead:
    return update_character(db, current_user.id, character_id, DND5E_RULE_SYSTEM, character_update)


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character_endpoint(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    delete_character(db, current_user.id, character_id)
